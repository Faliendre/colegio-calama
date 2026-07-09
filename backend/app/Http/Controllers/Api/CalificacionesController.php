<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use App\Models\Nota;
use App\Models\CriterioEvaluacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CalificacionesController extends Controller
{
    public function getAlumnos()
    {
        $alumnos = Alumno::all(['id', 'nombre', 'apellido_paterno', 'apellido_materno']);
        return response()->json($alumnos);
    }

    public function getReporte($alumnoId, Request $request)
    {
        try {
            $alumno = Alumno::findOrFail($alumnoId);

            // Determinar la gestión a usar
            $gestionId = $request->query('gestion_id');

            if (!$gestionId) {
                // Si no se proporciona gestión, usar la activa
                $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();
                $gestionId = $gestionActiva ? $gestionActiva->id : null;
            }

            if (!$gestionId) {
                return response()->json(['error' => 'No hay gestión académica seleccionada o activa'], 404);
            }

            // Validación de control de acceso para prevenir IDOR
            $user = auth()->user();
            if ($user && $user->role !== 'administrador') {
                $matricula = DB::table('matriculas')
                    ->where('alumno_id', $alumnoId)
                    ->where('gestion_academica_id', $gestionId)
                    ->where('estado', 'activo')
                    ->first();

                if (!$matricula) {
                    return response()->json(['error' => 'El estudiante no cuenta con una matrícula activa en la gestión seleccionada.'], 404);
                }

                if ($user->role === 'profesor') {
                    $tienePermiso = DB::table('asignaciones_profesor')
                        ->where('profesor_id', $user->id)
                        ->where('curso_id', $matricula->curso_id)
                        ->where('gestion_academica_id', $gestionId)
                        ->exists();

                    if (!$tienePermiso) {
                        return response()->json(['message' => 'No autorizado. Este estudiante no pertenece a sus cursos asignados.'], 403);
                    }
                } elseif ($user->role === 'asesor') {
                    $tienePermiso = DB::table('cursos')
                        ->where('id', $matricula->curso_id)
                        ->where('asesor_id', $user->id)
                        ->exists();

                    if (!$tienePermiso) {
                        return response()->json(['message' => 'No autorizado. Este estudiante no pertenece al curso que asesora.'], 403);
                    }
                } else {
                    return response()->json(['message' => 'No autorizado.'], 403);
                }
            }

            // Obtener todas las notas del alumno con sus relaciones, FILTRADAS POR GESTIÓN
            $notas = Nota::where('alumno_id', $alumnoId)
                ->with([
                    'criterioEvaluacion.asignacionProfesor.materia',
                    'criterioEvaluacion.trimestre'
                ])
                ->whereHas('criterioEvaluacion.asignacionProfesor', function ($query) use ($gestionId) {
                    $query->where('gestion_academica_id', $gestionId);
                })
                ->get();

            if ($notas->isEmpty()) {
                return response()->json([
                    'alumno' => [
                        'nombre' => $alumno->nombre,
                        'apellido_paterno' => $alumno->apellido_paterno,
                        'apellido_materno' => $alumno->apellido_materno
                    ],
                    'curso' => 'N/A',
                    'materias' => [],
                    'trimestres' => [],
                    'estadisticas' => [
                        ['label' => 'Promedio General', 'valor' => 0],
                        ['label' => 'Materias Aprobadas', 'valor' => 0],
                        ['label' => 'Materias Reprobadas', 'valor' => 0]
                    ]
                ]);
            }

            // Agrupar por materia
            $materiasPorNombre = [];

            foreach ($notas as $nota) {
                $criterio = $nota->criterioEvaluacion;
                $materia = $criterio->asignacionProfesor->materia;
                $trimestre = $criterio->trimestre;

                $nombreMateria = $materia->nombre;
                $trimestreId = $trimestre->id;

                if (!isset($materiasPorNombre[$nombreMateria])) {
                    $materiasPorNombre[$nombreMateria] = [
                        1 => ['notas' => [], 'ponderaciones' => []],
                        2 => ['notas' => [], 'ponderaciones' => []],
                        3 => ['notas' => [], 'ponderaciones' => []]
                    ];
                }

                // Agregar nota y ponderación
                $materiasPorNombre[$nombreMateria][$trimestreId]['notas'][] = $nota->nota;
                $materiasPorNombre[$nombreMateria][$trimestreId]['ponderaciones'][] = $criterio->ponderacion;
            }

            // Calcular promedios trimestrales
            $materiasArray = [];
            $todosLosPromedios = [];

            foreach ($materiasPorNombre as $nombreMateria => $trimestres) {
                $promediosTrimestre = [0, 0, 0];

                for ($t = 1; $t <= 3; $t++) {
                    if (!empty($trimestres[$t]['notas'])) {
                        // Calcular promedio ponderado
                        $sumaPonderada = 0;
                        $sumaPonderaciones = 0;

                        for ($i = 0; $i < count($trimestres[$t]['notas']); $i++) {
                            $nota = $trimestres[$t]['notas'][$i];
                            $ponderacion = $trimestres[$t]['ponderaciones'][$i] / 100;
                            $sumaPonderada += $nota * $ponderacion;
                            $sumaPonderaciones += $ponderacion;
                        }

                        $promediosTrimestre[$t - 1] = $sumaPonderaciones > 0
                            ? $sumaPonderada / $sumaPonderaciones
                            : 0;
                    }
                }

                $materiasArray[] = [
                    'nombre' => $nombreMateria,
                    'trimestres' => $promediosTrimestre
                ];

                // Agregar promedios no cero a la lista general
                foreach ($promediosTrimestre as $prom) {
                    if ($prom > 0) {
                        $todosLosPromedios[] = $prom;
                    }
                }
            }

            // Calcular promedio general
            $promedio = count($todosLosPromedios) > 0
                ? array_sum($todosLosPromedios) / count($todosLosPromedios)
                : 0;

            return response()->json([
                'alumno' => [
                    'nombre' => $alumno->nombre,
                    'apellido_paterno' => $alumno->apellido_paterno,
                    'apellido_materno' => $alumno->apellido_materno
                ],
                'curso' => 'N/A',
                'materias' => $materiasArray,
                'trimestres' => $todosLosPromedios,
                'estadisticas' => [
                    ['label' => 'Promedio General', 'valor' => round($promedio, 2)],
                    ['label' => 'Materias Aprobadas', 'valor' => $this->contarAprobadas($materiasArray)],
                    ['label' => 'Materias Reprobadas', 'valor' => count($materiasArray) - $this->contarAprobadas($materiasArray)]
                ],
                'gestion_id' => $gestionId
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function contarAprobadas($materias)
    {
        $aprobadas = 0;
        foreach ($materias as $materia) {
            $trimestresConNota = array_filter($materia['trimestres'], function ($t) {
                return $t > 0;
            });

            if (count($trimestresConNota) > 0) {
                $promedio = array_sum($trimestresConNota) / count($trimestresConNota);
                if ($promedio >= 51) { // ← CORREGIDO: 51 en lugar de 70
                    $aprobadas++;
                }
            }
        }
        return $aprobadas;
    }
}
