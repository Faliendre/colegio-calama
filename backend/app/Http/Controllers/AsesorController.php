<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AsesorController extends Controller
{
    // Dashboard del asesor
    public function dashboard()
    {
        $usuario = Auth::user();

        // Obtener gestión activa
        $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();

        if (!$gestionActiva) {
            return response()->json([
                'curso_asignado' => 0,
                'curso_info' => null,
                'total_estudiantes' => 0,
                'promedio_general' => 0
            ]);
        }

        // Obtener el curso asignado al asesor
        $curso = DB::table('cursos')
            ->where('asesor_id', $usuario->id)
            ->select('id', 'grado', 'paralelo')
            ->first();

        if (!$curso) {
            return response()->json([
                'curso_asignado' => 0,
                'curso_info' => null,
                'total_estudiantes' => 0,
                'promedio_general' => 0
            ]);
        }

        // Total de estudiantes del curso EN LA GESTIÓN ACTIVA
        $totalEstudiantes = DB::table('matriculas')
            ->where('curso_id', $curso->id)
            ->where('gestion_academica_id', $gestionActiva->id)
            ->where('estado', 'activo')
            ->count();

        // Calcular promedio general del curso (opcional)
        $promedioGeneral = 0;

        // Obtener actividad reciente (Los asesores no realizan escrituras, por lo que se mantiene en blanco para mostrar el estado Listo)
        $recentActivity = [];

        // Ordenar
        usort($recentActivity, function($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });
        $recentActivity = array_slice($recentActivity, 0, 5);

        if (empty($recentActivity)) {
            $recentActivity[] = [
                'title' => 'Panel Asesor Listo',
                'description' => 'Aún no se registran actividades para los alumnos de tu curso.',
                'type' => 'sistema',
                'created_at' => now()->toIso8601String(),
                'time_ago' => 'Hoy',
                'icon' => 'check-circle',
                'color' => '#10b981'
            ];
        }

        return response()->json([
            'curso_asignado' => 1,
            'curso_info' => $curso,
            'total_estudiantes' => $totalEstudiantes,
            'promedio_general' => $promedioGeneral,
            'gestion_actual' => $gestionActiva->anio,
            'recent_activity' => $recentActivity
        ]);
    }

    // Obtener lista de estudiantes del curso
    public function getEstudiantes()
    {
        $usuario = Auth::user();

        // Obtener gestión activa
        $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();

        if (!$gestionActiva) {
            return response()->json([]);
        }

        // Obtener el curso del asesor
        $curso = DB::table('cursos')
            ->where('asesor_id', $usuario->id)
            ->first();

        if (!$curso) {
            return response()->json([]);
        }

        // Obtener estudiantes del curso EN LA GESTIÓN ACTIVA
        $estudiantes = DB::table('matriculas')
            ->join('alumnos', 'matriculas.alumno_id', '=', 'alumnos.id')
            ->where('matriculas.curso_id', $curso->id)
            ->where('matriculas.gestion_academica_id', $gestionActiva->id)
            ->where('matriculas.estado', 'activo')
            ->select(
                'alumnos.id',
                'alumnos.codigo_rude',
                'alumnos.nombre',
                'alumnos.apellido_paterno',
                'alumnos.apellido_materno',
                'alumnos.fecha_nacimiento',
                'alumnos.genero',
                'matriculas.id as matricula_id',
                'matriculas.fecha_matricula'
            )
            ->orderBy('alumnos.apellido_paterno')
            ->orderBy('alumnos.nombre')
            ->get();

        return response()->json($estudiantes);
    }

    // Obtener reporte consolidado de notas del curso
    public function getReporteNotas(Request $request)
    {
        $usuario = Auth::user();
        $trimestreId = $request->query('trimestre_id', 1);

        // Obtener gestión activa
        $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();

        if (!$gestionActiva) {
            return response()->json([]);
        }

        // Obtener el curso del asesor
        $curso = DB::table('cursos')
            ->where('asesor_id', $usuario->id)
            ->first();

        if (!$curso) {
            return response()->json([]);
        }

        // Obtener estudiantes del curso EN LA GESTIÓN ACTIVA
        $estudiantes = DB::table('matriculas')
            ->join('alumnos', 'matriculas.alumno_id', '=', 'alumnos.id')
            ->where('matriculas.curso_id', $curso->id)
            ->where('matriculas.gestion_academica_id', $gestionActiva->id)
            ->where('matriculas.estado', 'activo')
            ->select('alumnos.id', 'alumnos.codigo_rude', 'alumnos.nombre', 'alumnos.apellido_paterno', 'alumnos.apellido_materno')
            ->orderBy('alumnos.apellido_paterno')
            ->get();

        // Obtener todas las materias del curso EN LA GESTIÓN ACTIVA
        $materias = DB::table('asignaciones_profesor')
            ->join('materias', 'asignaciones_profesor.materia_id', '=', 'materias.id')
            ->where('asignaciones_profesor.curso_id', $curso->id)
            ->where('asignaciones_profesor.gestion_academica_id', $gestionActiva->id)
            ->select('materias.id', 'materias.nombre as materia_nombre', 'asignaciones_profesor.id as asignacion_id')
            ->distinct()
            ->get();

        $reporte = [];

        foreach ($estudiantes as $estudiante) {
            $notasPorMateria = [];
            $sumaPromedios = 0;
            $materiasConNotas = 0;

            foreach ($materias as $materia) {
                $criterios = DB::table('criterios_evaluacion')
                    ->where('asignacion_profesor_id', $materia->asignacion_id)
                    ->where('trimestre_id', $trimestreId)
                    ->pluck('id');

                if ($criterios->isEmpty()) {
                    $notasPorMateria[] = [
                        'materia_id' => $materia->id,
                        'materia_nombre' => $materia->materia_nombre,
                        'promedio' => null,
                        'tiene_notas' => false
                    ];
                    continue;
                }

                $notas = DB::table('notas')
                    ->whereIn('criterio_evaluacion_id', $criterios)
                    ->where('alumno_id', $estudiante->id)
                    ->pluck('nota');

                $promedio = null;
                $tieneNotas = false;

                if ($notas->count() > 0) {
                    $promedio = round($notas->avg(), 2);
                    $sumaPromedios += $promedio;
                    $materiasConNotas++;
                    $tieneNotas = true;
                }

                $notasPorMateria[] = [
                    'materia_id' => $materia->id,
                    'materia_nombre' => $materia->materia_nombre,
                    'promedio' => $promedio,
                    'tiene_notas' => $tieneNotas
                ];
            }

            $promedioGeneral = $materiasConNotas > 0 ? round($sumaPromedios / $materiasConNotas, 2) : 0;

            $reporte[] = [
                'alumno_id' => $estudiante->id,
                'codigo_rude' => $estudiante->codigo_rude,
                'nombre' => $estudiante->nombre,
                'apellido_paterno' => $estudiante->apellido_paterno,
                'apellido_materno' => $estudiante->apellido_materno,
                'notas_por_materia' => $notasPorMateria,
                'promedio_general' => $promedioGeneral
            ];
        }

        return response()->json([
            'materias' => $materias,
            'reporte' => $reporte
        ]);
    }

    // Obtener reporte consolidado de asistencia
    public function getReporteAsistencia(Request $request)
    {
        $usuario = Auth::user();
        $fechaInicio = $request->query('fecha_inicio');
        $fechaFin = $request->query('fecha_fin');

        // Obtener gestión activa
        $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();

        if (!$gestionActiva) {
            return response()->json([]);
        }

        // Obtener el curso del asesor
        $curso = DB::table('cursos')
            ->where('asesor_id', $usuario->id)
            ->first();

        if (!$curso) {
            return response()->json([]);
        }

        // Obtener estudiantes del curso EN LA GESTIÓN ACTIVA
        $estudiantes = DB::table('matriculas')
            ->join('alumnos', 'matriculas.alumno_id', '=', 'alumnos.id')
            ->where('matriculas.curso_id', $curso->id)
            ->where('matriculas.gestion_academica_id', $gestionActiva->id)
            ->where('matriculas.estado', 'activo')
            ->select('alumnos.id', 'alumnos.codigo_rude', 'alumnos.nombre', 'alumnos.apellido_paterno', 'alumnos.apellido_materno')
            ->orderBy('alumnos.apellido_paterno')
            ->get();

        $reporte = [];

        foreach ($estudiantes as $estudiante) {
            $query = DB::table('asistencias')
                ->join('asignaciones_profesor', 'asistencias.asignacion_profesor_id', '=', 'asignaciones_profesor.id')
                ->where('asignaciones_profesor.curso_id', $curso->id)
                ->where('asignaciones_profesor.gestion_academica_id', $gestionActiva->id)
                ->where('asistencias.alumno_id', $estudiante->id);

            if ($fechaInicio && $fechaFin) {
                $query->whereBetween('asistencias.fecha', [$fechaInicio, $fechaFin]);
            }

            $totalPresente = (clone $query)->where('asistencias.estado', 'presente')->count();
            $totalAusente = (clone $query)->where('asistencias.estado', 'ausente')->count();
            $totalLicencia = (clone $query)->where('asistencias.estado', 'licencia')->count();
            $totalRegistros = $totalPresente + $totalAusente + $totalLicencia;

            $porcentajeAsistencia = $totalRegistros > 0
                ? round(($totalPresente / $totalRegistros) * 100, 2)
                : 0;

            $reporte[] = [
                'alumno_id' => $estudiante->id,
                'codigo_rude' => $estudiante->codigo_rude,
                'nombre' => $estudiante->nombre,
                'apellido_paterno' => $estudiante->apellido_paterno,
                'apellido_materno' => $estudiante->apellido_materno,
                'presente' => $totalPresente,
                'ausente' => $totalAusente,
                'licencia' => $totalLicencia,
                'total_registros' => $totalRegistros,
                'porcentaje_asistencia' => $porcentajeAsistencia
            ];
        }

        return response()->json($reporte);
    }

    // Obtener ficha completa del estudiante
    public function getFichaEstudiante($alumnoId)
    {
        $usuario = Auth::user();

        // Obtener gestión activa
        $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();

        if (!$gestionActiva) {
            return response()->json(['error' => 'No hay gestión académica activa'], 404);
        }

        // Verificar que el estudiante pertenece al curso del asesor
        $curso = DB::table('cursos')
            ->where('asesor_id', $usuario->id)
            ->first();

        if (!$curso) {
            return response()->json(['error' => 'No tienes un curso asignado'], 403);
        }

        // Datos básicos del alumno EN LA GESTIÓN ACTIVA
        $alumno = DB::table('alumnos')
            ->join('matriculas', 'alumnos.id', '=', 'matriculas.alumno_id')
            ->where('alumnos.id', $alumnoId)
            ->where('matriculas.curso_id', $curso->id)
            ->where('matriculas.gestion_academica_id', $gestionActiva->id)
            ->select(
                'alumnos.*',
                'matriculas.fecha_matricula',
                'matriculas.estado as estado_matricula'
            )
            ->first();

        if (!$alumno) {
            return response()->json(['error' => 'Estudiante no encontrado en la gestión actual'], 404);
        }

        // Calificaciones por trimestre
        $calificaciones = [];
        $trimestres = DB::table('trimestres')->get();

        foreach ($trimestres as $trimestre) {
            $materias = DB::table('asignaciones_profesor')
                ->join('materias', 'asignaciones_profesor.materia_id', '=', 'materias.id')
                ->join('users', 'asignaciones_profesor.profesor_id', '=', 'users.id')
                ->where('asignaciones_profesor.curso_id', $curso->id)
                ->where('asignaciones_profesor.gestion_academica_id', $gestionActiva->id)
                ->select(
                    'materias.id as materia_id',
                    'materias.nombre as materia_nombre',
                    'users.nombre as profesor_nombre',
                    'asignaciones_profesor.id as asignacion_id'
                )
                ->get();

            $materiasData = [];

            foreach ($materias as $materia) {
                $criterios = DB::table('criterios_evaluacion')
                    ->where('asignacion_profesor_id', $materia->asignacion_id)
                    ->where('trimestre_id', $trimestre->id)
                    ->pluck('id');

                if ($criterios->isEmpty()) {
                    $materiasData[] = [
                        'materia_nombre' => $materia->materia_nombre,
                        'profesor' => $materia->profesor_nombre,
                        'promedio' => null
                    ];
                    continue;
                }

                $notas = DB::table('notas')
                    ->whereIn('criterio_evaluacion_id', $criterios)
                    ->where('alumno_id', $alumnoId)
                    ->pluck('nota');

                $promedio = $notas->count() > 0 ? round($notas->avg(), 2) : null;

                $materiasData[] = [
                    'materia_nombre' => $materia->materia_nombre,
                    'profesor' => $materia->profesor_nombre,
                    'promedio' => $promedio
                ];
            }

            $calificaciones[] = [
                'trimestre' => "Trimestre {$trimestre->numero}",
                'trimestre_id' => $trimestre->id,
                'materias' => $materiasData
            ];
        }

        // Resumen de asistencia DE LA GESTIÓN ACTIVA
        $asistenciaTotal = DB::table('asistencias')
            ->join('asignaciones_profesor', 'asistencias.asignacion_profesor_id', '=', 'asignaciones_profesor.id')
            ->where('asignaciones_profesor.curso_id', $curso->id)
            ->where('asignaciones_profesor.gestion_academica_id', $gestionActiva->id)
            ->where('asistencias.alumno_id', $alumnoId);

        $totalPresente = (clone $asistenciaTotal)->where('estado', 'presente')->count();
        $totalAusente = (clone $asistenciaTotal)->where('estado', 'ausente')->count();
        $totalLicencia = (clone $asistenciaTotal)->where('estado', 'licencia')->count();
        $totalRegistros = $totalPresente + $totalAusente + $totalLicencia;
        $porcentaje = $totalRegistros > 0 ? round(($totalPresente / $totalRegistros) * 100, 2) : 0;

        $resumenAsistencia = [
            'presente' => $totalPresente,
            'ausente' => $totalAusente,
            'licencia' => $totalLicencia,
            'total_registros' => $totalRegistros,
            'porcentaje_asistencia' => $porcentaje
        ];

        return response()->json([
            'alumno' => $alumno,
            'calificaciones' => $calificaciones,
            'asistencia' => $resumenAsistencia
        ]);
    }
}
