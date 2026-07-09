<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\Alumno;
use App\Models\Curso;
use App\Models\Matricula;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\AsignacionProfesor;

class AsistenciaController extends Controller
{
    /**
     * Reporte de asistencias por curso y rango de fechas
     */
    public function reporte(Request $request)
    {
        $request->validate([
            'curso_id' => 'required|exists:cursos,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'gestion_id' => 'nullable|exists:gestion_academica,id', // ← NUEVO: parámetro opcional
        ]);

        // Determinar la gestión a usar (parámetro o gestión activa)
        $gestionId = $request->gestion_id;

        if (!$gestionId) {
            // Si no se proporciona gestión, usar la activa
            $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();
            $gestionId = $gestionActiva ? $gestionActiva->id : null;
        }

        if (!$gestionId) {
            return response()->json(['error' => 'No hay gestión académica seleccionada o activa'], 404);
        }

        // Obtener IDs de asignaciones del curso EN LA GESTIÓN ESPECIFICADA
        $asignacionesIds = AsignacionProfesor::where('curso_id', $request->curso_id)
            ->where('gestion_academica_id', $gestionId) // ← FILTRO AGREGADO
            ->pluck('id')
            ->toArray();

        // Obtener alumnos matriculados en el curso EN LA GESTIÓN ESPECIFICADA
        $matriculas = Matricula::with('alumno')
            ->where('curso_id', $request->curso_id)
            ->where('gestion_academica_id', $gestionId) // ← FILTRO AGREGADO
            ->where('estado', 'activo')
            ->get();

        // Generar rango de fechas
        $fechas = [];
        $start = \Carbon\Carbon::parse($request->fecha_inicio);
        $end = \Carbon\Carbon::parse($request->fecha_fin);
        while ($start->lte($end)) {
            $fechas[] = $start->format('Y-m-d');
            $start->addDay();
        }

        // Construir reporte
        $reporte = [];
        foreach ($matriculas as $matricula) {
            $asistenciasQuery = Asistencia::where('alumno_id', $matricula->alumno_id)
                ->whereIn('asignacion_profesor_id', $asignacionesIds)
                ->whereBetween('fecha', [$request->fecha_inicio, $request->fecha_fin])
                ->get();

            $asistencias = $asistenciasQuery->keyBy(function ($item) {
                return \Carbon\Carbon::parse($item->fecha)->format('Y-m-d');
            });

            $fila = [
                'alumno_id' => $matricula->alumno->id,
                'nombre' => $matricula->alumno->nombre,
                'apellido_paterno' => $matricula->alumno->apellido_paterno,
                'apellido_materno' => $matricula->alumno->apellido_materno,
                'asistencias' => [],
            ];

            foreach ($fechas as $fecha) {
                $fila['asistencias'][$fecha] = isset($asistencias[$fecha])
                    ? $asistencias[$fecha]->estado
                    : 'Sin registro';
            }

            $reporte[] = $fila;
        }

        return response()->json([
            'fechas' => $fechas,
            'reporte' => $reporte,
            'gestion_id' => $gestionId // ← Devolver la gestión usada
        ]);
    }
}
