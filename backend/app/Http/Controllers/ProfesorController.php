<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Curso;
use App\Models\Alumno;
use App\Models\Asistencia;
use App\Models\NotaTrimestral;
use App\Models\Nota;
use App\Models\CriterioEvaluacion;
use Illuminate\Support\Facades\DB;

class ProfesorController extends Controller
{
    // Dashboard del profesor
    // Dashboard del profesor
    public function dashboard(Request $request)
    {
        $profesorId = $request->user()->id;

        // Obtener gestión activa
        $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();

        if (!$gestionActiva) {
            return response()->json([
                'error' => 'No hay gestión académica activa',
                'cursos_asignados' => 0,
                'total_alumnos' => 0,
                'asistencias_hoy' => 0
            ]);
        }

        // Cursos asignados al profesor EN LA GESTIÓN ACTIVA
        $cursosCount = DB::table('asignaciones_profesor')
            ->where('profesor_id', $profesorId)
            ->where('gestion_academica_id', $gestionActiva->id)
            ->distinct('curso_id')
            ->count('curso_id');

        // Total de alumnos en sus cursos DE LA GESTIÓN ACTIVA
        $alumnosCount = DB::table('matriculas')
            ->whereIn('curso_id', function ($query) use ($profesorId, $gestionActiva) {
                $query->select('curso_id')
                    ->from('asignaciones_profesor')
                    ->where('profesor_id', $profesorId)
                    ->where('gestion_academica_id', $gestionActiva->id);
            })
            ->where('gestion_academica_id', $gestionActiva->id)
            ->where('estado', 'activo')
            ->count();

        // Asistencias registradas hoy
        $asistenciasHoy = Asistencia::whereDate('fecha', today())
            ->whereHas('asignacionProfesor', function ($query) use ($profesorId, $gestionActiva) {
                $query->where('profesor_id', $profesorId)
                    ->where('gestion_academica_id', $gestionActiva->id);
            })
            ->count();

        // 1. Calificaciones registradas por este profesor (agrupadas por criterio)
        try {
            $recentGrades = \App\Models\Nota::with(['criterioEvaluacion.asignacionProfesor.materia', 'criterioEvaluacion.asignacionProfesor.curso'])
                ->select('criterio_evaluacion_id', \DB::raw('MAX(created_at) as created_at'))
                ->whereHas('criterioEvaluacion.asignacionProfesor', function($q) use ($profesorId, $gestionActiva) {
                    $q->where('profesor_id', $profesorId)
                      ->where('gestion_academica_id', $gestionActiva->id);
                })
                ->groupBy('criterio_evaluacion_id')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
            foreach ($recentGrades as $n) {
                if ($n->criterioEvaluacion && $n->criterioEvaluacion->asignacionProfesor && $n->criterioEvaluacion->asignacionProfesor->materia) {
                    $materiaNombre = $n->criterioEvaluacion->asignacionProfesor->materia->nombre;
                    $cursoNombre = $n->criterioEvaluacion->asignacionProfesor->curso->grado . '° "' . $n->criterioEvaluacion->asignacionProfesor->curso->paralelo . '"';
                    $recentActivity[] = [
                        'title' => 'Calificaciones Registradas',
                        'description' => "Registraste notas para el criterio '{$n->criterioEvaluacion->nombre}' de {$materiaNombre} en {$cursoNombre}",
                        'type' => 'nota',
                        'created_at' => $n->created_at ? $n->created_at->toIso8601String() : now()->toIso8601String(),
                        'time_ago' => $n->created_at ? $n->created_at->diffForHumans() : 'Recientemente',
                        'icon' => 'academic-cap',
                        'color' => '#3b82f6'
                    ];
                }
            }
        } catch (\Exception $e) {}

        // 2. Asistencias registradas por este profesor (agrupadas por asignación y fecha)
        try {
            $recentAttendances = \App\Models\Asistencia::with(['asignacionProfesor.materia', 'asignacionProfesor.curso'])
                ->select('asignacion_profesor_id', 'fecha', \DB::raw('MAX(created_at) as created_at'))
                ->whereHas('asignacionProfesor', function($q) use ($profesorId, $gestionActiva) {
                    $q->where('profesor_id', $profesorId)
                      ->where('gestion_academica_id', $gestionActiva->id);
                })
                ->groupBy('asignacion_profesor_id', 'fecha')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();
            foreach ($recentAttendances as $a) {
                if ($a->asignacionProfesor && $a->asignacionProfesor->materia && $a->asignacionProfesor->curso) {
                    $materiaNombre = $a->asignacionProfesor->materia->nombre;
                    $cursoNombre = $a->asignacionProfesor->curso->grado . '° "' . $a->asignacionProfesor->curso->paralelo . '"';
                    $fechaFormateada = $a->fecha ? $a->fecha->format('d/m/Y') : '';
                    $recentActivity[] = [
                        'title' => 'Asistencia Registrada',
                        'description' => "Registraste la asistencia en {$materiaNombre} de {$cursoNombre} (Clase: {$fechaFormateada})",
                        'type' => 'asistencia',
                        'created_at' => $a->created_at ? $a->created_at->toIso8601String() : now()->toIso8601String(),
                        'time_ago' => $a->created_at ? $a->created_at->diffForHumans() : 'Recientemente',
                        'icon' => 'clipboard-check',
                        'color' => '#f59e0b'
                    ];
                }
            }
        } catch (\Exception $e) {}

        // Ordenar por fecha desc
        usort($recentActivity, function($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });
        $recentActivity = array_slice($recentActivity, 0, 5);

        if (empty($recentActivity)) {
            $recentActivity[] = [
                'title' => 'Panel Profesor Listo',
                'description' => 'Aún no registras actividades académicas en esta gestión.',
                'type' => 'sistema',
                'created_at' => now()->toIso8601String(),
                'time_ago' => 'Hoy',
                'icon' => 'check-circle',
                'color' => '#10b981'
            ];
        }

        return response()->json([
            'cursos_asignados' => $cursosCount,
            'total_alumnos' => $alumnosCount,
            'asistencias_hoy' => $asistenciasHoy,
            'gestion_actual' => $gestionActiva->anio,
            'recent_activity' => $recentActivity
        ]);
    }

    // Ver cursos asignados
    public function misCursos(Request $request)
    {
        $profesorId = $request->user()->id;

        try {
            // Obtener gestión activa
            $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();

            if (!$gestionActiva) {
                return response()->json(['error' => 'No hay gestión académica activa'], 404);
            }

            $cursos = DB::table('asignaciones_profesor')
                ->join('materias', 'asignaciones_profesor.materia_id', '=', 'materias.id')
                ->join('cursos', 'asignaciones_profesor.curso_id', '=', 'cursos.id')
                ->where('asignaciones_profesor.profesor_id', $profesorId)
                ->where('asignaciones_profesor.gestion_academica_id', $gestionActiva->id) // ← FILTRO AGREGADO
                ->select(
                    'cursos.id as curso_id',
                    'cursos.grado',
                    'cursos.paralelo',
                    'materias.nombre as materia',
                    'materias.id as materia_id',
                    'asignaciones_profesor.id as asignacion_id'
                )
                ->distinct()
                ->get();

            // Contar alumnos por curso DE LA GESTIÓN ACTIVA
            foreach ($cursos as $curso) {
                $curso->total_alumnos = DB::table('matriculas')
                    ->where('curso_id', $curso->curso_id)
                    ->where('gestion_academica_id', $gestionActiva->id)
                    ->where('estado', 'activo')
                    ->count();
            }

            return response()->json($cursos);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Ver alumnos por curso
    public function alumnosPorCurso($cursoId)
    {
        // Obtener gestión activa
        $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();

        if (!$gestionActiva) {
            return response()->json(['error' => 'No hay gestión académica activa'], 404);
        }

        $alumnos = DB::table('matriculas')
            ->join('alumnos', 'matriculas.alumno_id', '=', 'alumnos.id')
            ->where('matriculas.curso_id', $cursoId)
            ->where('matriculas.gestion_academica_id', $gestionActiva->id)
            ->where('matriculas.estado', 'activo')
            ->select(
                'alumnos.id',
                'alumnos.codigo_rude',
                'alumnos.nombre',
                'alumnos.apellido_paterno',
                'alumnos.apellido_materno',
                'matriculas.id as matricula_id'
            )
            ->orderBy('alumnos.apellido_paterno')
            ->get();

        return response()->json($alumnos);
    }


    // Registrar asistencia
    public function registrarAsistencia(Request $request)
    {
        try {
            $request->validate([
                'asignacion_profesor_id' => 'required|exists:asignaciones_profesor,id',
                'fecha' => 'required|date',
                'asistencias' => 'required|array',
                'asistencias.*.alumno_id' => 'required|exists:alumnos,id',
                'asistencias.*.estado' => 'required|in:presente,ausente,tarde,licencia'
            ]);

            foreach ($request->asistencias as $item) {
                Asistencia::updateOrCreate(
                    [
                        'asignacion_profesor_id' => $request->asignacion_profesor_id,
                        'alumno_id' => $item['alumno_id'],
                        'fecha' => $request->fecha
                    ],
                    [
                        'estado' => $item['estado'],
                        'observaciones' => $item['observaciones'] ?? null
                    ]
                );
            }

            return response()->json([
                'message' => 'Asistencias registradas exitosamente',
                'total' => count($request->asistencias)
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Error de validación',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al guardar asistencia',
                'message' => $e->getMessage()
            ], 500);
        }
    }


    // Ver asistencia de un curso
    public function verAsistencia($cursoId, Request $request)
    {
        $fecha = $request->query('fecha', today()->toDateString());
        $asignacionId = $request->query('asignacion_id');

        $asistencias = DB::table('asistencias')
            ->join('alumnos', 'asistencias.alumno_id', '=', 'alumnos.id')
            ->where('asistencias.asignacion_profesor_id', $asignacionId)
            ->where('asistencias.fecha', $fecha)
            ->select(
                'asistencias.id',
                'asistencias.alumno_id',
                'alumnos.nombre',
                'alumnos.apellido_paterno',
                'alumnos.apellido_materno',
                'asistencias.estado',
                'asistencias.observaciones',
                'asistencias.fecha'
            )
            ->orderBy('alumnos.apellido_paterno')
            ->get();

        return response()->json($asistencias);
    }

    // Crear criterio de evaluación (trabajo/examen)
    public function crearCriterio(Request $request)
    {
        try {
            $request->validate([
                'asignacion_profesor_id' => 'required|exists:asignaciones_profesor,id',
                'trimestre_id' => 'required|exists:trimestres,id',
                'nombre' => 'required|string|max:100'
            ]);

            $criterio = CriterioEvaluacion::create([
                'asignacion_profesor_id' => $request->asignacion_profesor_id,
                'trimestre_id' => $request->trimestre_id,
                'nombre' => $request->nombre,
                'ponderacion' => 100, // Valor por defecto
                'fecha_creacion' => now() // Agregamos la fecha actual
            ]);

            return response()->json([
                'message' => 'Criterio creado exitosamente',
                'criterio' => $criterio
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al crear criterio',
                'message' => $e->getMessage()
            ], 500);
        }
    }



    // Registrar calificaciones
    public function registrarCalificacion(Request $request)
    {
        try {
            $request->validate([
                'criterio_evaluacion_id' => 'required|exists:criterios_evaluacion,id',
                'calificaciones' => 'required|array',
                'calificaciones.*.alumno_id' => 'required|exists:alumnos,id',
                'calificaciones.*.nota' => 'required|numeric|min:0|max:100' // ← CAMBIO AQUÍ
            ]);

            foreach ($request->calificaciones as $item) {
                Nota::updateOrCreate(
                    [
                        'criterio_evaluacion_id' => $request->criterio_evaluacion_id,
                        'alumno_id' => $item['alumno_id']
                    ],
                    [
                        'nota' => $item['nota'],
                        'observaciones' => $item['observaciones'] ?? null
                    ]
                );
            }

            return response()->json([
                'message' => 'Calificaciones registradas exitosamente',
                'total' => count($request->calificaciones)
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Error de validación',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al guardar calificaciones',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Ver calificaciones de un curso
    public function verCalificaciones($cursoId, Request $request)
    {
        $trimestreId = $request->query('trimestre_id');
        $asignacionId = $request->query('asignacion_id');

        $calificaciones = DB::table('notas')
            ->join('criterios_evaluacion', 'notas.criterio_evaluacion_id', '=', 'criterios_evaluacion.id')
            ->join('alumnos', 'notas.alumno_id', '=', 'alumnos.id')
            ->where('criterios_evaluacion.asignacion_profesor_id', $asignacionId)
            ->where('criterios_evaluacion.trimestre_id', $trimestreId)
            ->select(
                'notas.id',
                'notas.alumno_id',
                'alumnos.nombre',
                'alumnos.apellido_paterno',
                'alumnos.apellido_materno',
                'criterios_evaluacion.nombre as criterio',
                'notas.nota',
                'notas.observaciones'
            )
            ->orderBy('alumnos.apellido_paterno')
            ->get();

        return response()->json($calificaciones);
    }
    public function getCriterios(Request $request)
    {
        $asignacionId = $request->query('asignacion_id');
        $trimestreId = $request->query('trimestre_id');

        $criterios = CriterioEvaluacion::where('asignacion_profesor_id', $asignacionId)
            ->where('trimestre_id', $trimestreId)
            ->orderBy('fecha_creacion', 'desc')
            ->get();

        return response()->json($criterios);
    }
    public function getTrimestres()
    {
        $trimestres = DB::table('trimestres')
            ->orderBy('numero')
            ->get();

        return response()->json($trimestres);
    }
    public function getAsistenciasPorFecha(Request $request)
    {
        $asignacionId = $request->query('asignacion_id');
        $fecha = $request->query('fecha');

        $asistencias = DB::table('asistencias')
            ->join('alumnos', 'asistencias.alumno_id', '=', 'alumnos.id')
            ->where('asistencias.asignacion_profesor_id', $asignacionId)
            ->where('asistencias.fecha', $fecha)
            ->select(
                'asistencias.id as asistencia_id',
                'alumnos.id as alumno_id',
                'alumnos.codigo_rude',
                'alumnos.nombre',
                'alumnos.apellido_paterno',
                'alumnos.apellido_materno',
                'asistencias.estado',
                'asistencias.observaciones'
            )
            ->get();

        return response()->json($asistencias);
    }

    public function editarAsistencia(Request $request, $id)
    {
        try {
            $request->validate([
                'estado' => 'required|in:presente,ausente,licencia'
            ]);

            $asistencia = Asistencia::findOrFail($id);
            $asistencia->estado = $request->estado;
            $asistencia->observaciones = $request->observaciones ?? null;
            $asistencia->save();

            return response()->json([
                'message' => 'Asistencia actualizada exitosamente',
                'asistencia' => $asistencia
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al actualizar asistencia',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function getCalificacionesPorCriterio(Request $request)
    {
        $criterioId = $request->query('criterio_id');

        $calificaciones = DB::table('notas')
            ->join('alumnos', 'notas.alumno_id', '=', 'alumnos.id')
            ->where('notas.criterio_evaluacion_id', $criterioId)
            ->select(
                'notas.id as nota_id',
                'alumnos.id as alumno_id',
                'alumnos.codigo_rude',
                'alumnos.nombre',
                'alumnos.apellido_paterno',
                'alumnos.apellido_materno',
                'notas.nota',
                'notas.observaciones'
            )
            ->get();

        return response()->json($calificaciones);
    }

    public function editarNota(Request $request, $id)
    {
        try {
            $request->validate([
                'nota' => 'required|numeric|min:0|max:100'
            ]);

            $nota = Nota::findOrFail($id);
            $nota->nota = $request->nota;
            $nota->observaciones = $request->observaciones ?? null;
            $nota->save();

            return response()->json([
                'message' => 'Nota actualizada exitosamente',
                'nota' => $nota
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al actualizar nota',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    public function getPromediosTrimestre(Request $request)
    {
        $asignacionId = $request->query('asignacion_id');
        $trimestreId = $request->query('trimestre_id');

        // Obtener gestión activa
        $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();

        // Obtener todos los criterios del trimestre
        $criterios = DB::table('criterios_evaluacion')
            ->where('asignacion_profesor_id', $asignacionId)
            ->where('trimestre_id', $trimestreId)
            ->pluck('id');

        if ($criterios->isEmpty()) {
            return response()->json([]);
        }

        // Obtener alumnos del curso DE LA GESTIÓN ACTIVA
        $asignacion = DB::table('asignaciones_profesor')
            ->where('id', $asignacionId)
            ->first();

        $alumnos = DB::table('matriculas')
            ->join('alumnos', 'matriculas.alumno_id', '=', 'alumnos.id')
            ->where('matriculas.curso_id', $asignacion->curso_id)
            ->where('matriculas.gestion_academica_id', $gestionActiva->id)
            ->where('matriculas.estado', 'activo')
            ->select(
                'alumnos.id',
                'alumnos.codigo_rude',
                'alumnos.nombre',
                'alumnos.apellido_paterno',
                'alumnos.apellido_materno'
            )
            ->get();

        // Calcular promedio por alumno
        $promedios = [];

        foreach ($alumnos as $alumno) {
            $notas = DB::table('notas')
                ->whereIn('criterio_evaluacion_id', $criterios)
                ->where('alumno_id', $alumno->id)
                ->pluck('nota');

            $promedio = $notas->count() > 0 ? round($notas->avg(), 2) : 0;
            $totalNotas = $notas->count();
            $totalCriterios = $criterios->count();

            $promedios[] = [
                'alumno_id' => $alumno->id,
                'codigo_rude' => $alumno->codigo_rude,
                'nombre' => $alumno->nombre,
                'apellido_paterno' => $alumno->apellido_paterno,
                'apellido_materno' => $alumno->apellido_materno,
                'promedio' => $promedio,
                'notas_registradas' => $totalNotas,
                'total_evaluaciones' => $totalCriterios
            ];
        }

        return response()->json($promedios);
    }
}
