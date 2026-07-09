<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\Matricula;
use App\Models\Nota;
use App\Models\CriterioEvaluacion;
use App\Models\AsignacionProfesor;
use Illuminate\Http\Request;

class ActaCalificacionesController extends Controller
{
    public function generarActa(Request $request)
    {
        $request->validate([
            'curso_id' => 'required|exists:cursos,id',
            'gestion_id' => 'required|exists:gestion_academica,id'
        ]);

        $curso = Curso::findOrFail($request->curso_id);
        $gestionId = $request->gestion_id;

        // Obtener alumnos matriculados en el curso para esa gestión cargando notas de esta gestión
        $matriculas = Matricula::with([
            'alumno.notas' => function ($q) use ($gestionId) {
                $q->whereHas('criterioEvaluacion.asignacionProfesor', function ($subQ) use ($gestionId) {
                    $subQ->where('gestion_academica_id', $gestionId);
                });
            }
        ])
            ->where('curso_id', $request->curso_id)
            ->where('gestion_academica_id', $gestionId)
            ->where('estado', 'activo')
            ->orderBy('id')
            ->get();

        if ($matriculas->isEmpty()) {
            return response()->json(['error' => 'No hay alumnos matriculados en este curso'], 404);
        }

        // Obtener materias del curso (a través de asignaciones de profesor)
        $asignaciones = AsignacionProfesor::with('materia')
            ->where('curso_id', $request->curso_id)
            ->where('gestion_academica_id', $gestionId)
            ->get();

        $materias = $asignaciones->pluck('materia')->unique('id');

        // Precargar todos los criterios de evaluación de esta gestión para este curso
        $criteriosTodos = CriterioEvaluacion::whereIn(
            'asignacion_profesor_id',
            $asignaciones->pluck('id')
        )->get();

        // Construir acta
        $acta = [];

        foreach ($matriculas as $matricula) {
            $alumno = $matricula->alumno;
            $calificaciones = [];
            $totalPromediosMaterias = 0;
            $materiasConNota = 0;

            foreach ($materias as $materia) {
                $notasPorTrimestre = [0, 0, 0]; // T1, T2, T3
                $asignacion = $asignaciones->first(fn($a) => $a->materia_id === $materia->id);

                if ($asignacion) {
                    // Obtener notas por trimestre utilizando colecciones en memoria
                    for ($trimestre = 1; $trimestre <= 3; $trimestre++) {
                        $criterios = $criteriosTodos
                            ->where('asignacion_profesor_id', $asignacion->id)
                            ->where('trimestre_id', $trimestre);

                        if ($criterios->isEmpty()) {
                            continue;
                        }

                        $criteriosIds = $criterios->pluck('id')->toArray();
                        $notas = $alumno->notas->whereIn('criterio_evaluacion_id', $criteriosIds);

                        if ($notas->isEmpty()) {
                            $notasPorTrimestre[$trimestre - 1] = 0;
                            continue;
                        }

                        // Calcular promedio ponderado del trimestre
                        $sumaPonderada = 0;
                        $sumaPonderaciones = 0;

                        foreach ($notas as $nota) {
                            $criterio = $criterios->first(fn($c) => $c->id == $nota->criterio_evaluacion_id);
                            if ($criterio) {
                                $ponderacion = $criterio->ponderacion / 100;
                                $sumaPonderada += $nota->nota * $ponderacion;
                                $sumaPonderaciones += $ponderacion;
                            }
                        }

                        $notasPorTrimestre[$trimestre - 1] = $sumaPonderaciones > 0
                            ? $sumaPonderada / $sumaPonderaciones
                            : 0;
                    }
                }

                // Calcular promedio de la materia
                $notasConValor = array_filter($notasPorTrimestre, fn($n) => $n > 0);
                $promedioMateria = count($notasConValor) > 0
                    ? array_sum($notasConValor) / count($notasConValor)
                    : 0;

                if ($promedioMateria > 0) {
                    $totalPromediosMaterias += $promedioMateria;
                    $materiasConNota++;
                }

                $calificaciones[] = [
                    'materia' => $materia->nombre,
                    't1' => round($notasPorTrimestre[0], 2),
                    't2' => round($notasPorTrimestre[1], 2),
                    't3' => round($notasPorTrimestre[2], 2),
                    'promedio' => round($promedioMateria, 2)
                ];
            }

            // Promedio general del alumno
            $promedioGeneral = $materiasConNota > 0
                ? $totalPromediosMaterias / $materiasConNota
                : 0;

            $acta[] = [
                'alumno_id' => $alumno->id,
                'nombre_completo' => $alumno->nombre . ' ' . $alumno->apellido_paterno . ' ' . $alumno->apellido_materno,
                'calificaciones' => $calificaciones,
                'promedio_general' => round($promedioGeneral, 2),
                'estado' => $promedioGeneral >= 51 ? 'Aprobado' : 'Reprobado'
            ];
        }

        return response()->json([
            'curso' => [
                'nombre' => $curso->nombre ?? ($curso->grado . ' ' . $curso->paralelo),
                'grado' => $curso->grado,
                'paralelo' => $curso->paralelo
            ],
            'materias' => $materias->pluck('nombre')->values(),
            'acta' => $acta,
            'total_alumnos' => count($acta),
            'aprobados' => count(array_filter($acta, fn($a) => $a['estado'] === 'Aprobado')),
            'reprobados' => count(array_filter($acta, fn($a) => $a['estado'] === 'Reprobado'))
        ]);
    }
}
