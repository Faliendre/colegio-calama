<?php

namespace App\Http\Controllers;

use App\Models\AsignacionProfesor;
use App\Models\User;
use App\Models\Curso;
use App\Models\Materia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AsignacionProfesorController extends Controller
{
    /**
     * Listar todas las asignaciones
     */
    public function index(Request $request)
    {
        // Obtener gestión activa
        $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();

        $query = AsignacionProfesor::with(['profesor:id,nombre', 'curso:id,grado,paralelo', 'materia:id,nombre', 'gestionAcademica']);

        // Filtrar solo por gestión activa
        if ($gestionActiva) {
            $query->where('gestion_academica_id', $gestionActiva->id);
        }

        // Filtrar por curso
        if ($request->has('curso_id')) {
            $query->where('curso_id', $request->curso_id);
        }

        // Filtrar por profesor
        if ($request->has('profesor_id')) {
            $query->where('profesor_id', $request->profesor_id);
        }

        $asignaciones = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($asignacion) {
                return [
                    'id' => $asignacion->id,
                    'profesor_id' => $asignacion->profesor_id,
                    'profesor' => $asignacion->profesor->nombre,
                    'curso_id' => $asignacion->curso_id,
                    'curso' => $asignacion->curso->grado . ' "' . $asignacion->curso->paralelo . '"',
                    'materia_id' => $asignacion->materia_id,
                    'materia' => $asignacion->materia->nombre,
                    'gestion_academica_id' => $asignacion->gestion_academica_id,
                ];
            });

        return response()->json($asignaciones);
    }

    /**
     * Crear una nueva asignación
     */
    public function store(Request $request)
    {
        $request->validate([
            'profesor_id' => 'required|exists:users,id',
            'curso_id' => 'required|exists:cursos,id',
            'materia_id' => 'required|exists:materias,id',
        ]);

        // Obtener gestión activa automáticamente
        $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();

        if (!$gestionActiva) {
            return response()->json([
                'message' => 'No hay gestión académica activa'
            ], 422);
        }

        // Verificar que no exista la misma asignación
        $existe = AsignacionProfesor::where('profesor_id', $request->profesor_id)
            ->where('curso_id', $request->curso_id)
            ->where('materia_id', $request->materia_id)
            ->where('gestion_academica_id', $gestionActiva->id)
            ->exists();

        if ($existe) {
            return response()->json([
                'message' => 'Esta asignación ya existe para la gestión actual'
            ], 422);
        }

        $asignacion = AsignacionProfesor::create([
            'profesor_id' => $request->profesor_id,
            'curso_id' => $request->curso_id,
            'materia_id' => $request->materia_id,
            'gestion_academica_id' => $gestionActiva->id,
        ]);

        return response()->json([
            'message' => 'Asignación creada exitosamente para la gestión ' . $gestionActiva->anio,
            'asignacion' => $asignacion
        ], 201);
    }

    /**
     * Mostrar una asignación específica
     */
    public function show($id)
    {
        $asignacion = AsignacionProfesor::with(['profesor', 'curso', 'materia', 'gestionAcademica'])->findOrFail($id);
        return response()->json($asignacion);
    }

    /**
     * Actualizar una asignación
     */
    public function update(Request $request, $id)
    {
        $asignacion = AsignacionProfesor::findOrFail($id);

        $request->validate([
            'profesor_id' => 'required|exists:users,id',
            'curso_id' => 'required|exists:cursos,id',
            'materia_id' => 'required|exists:materias,id',
        ]);

        // Obtener gestión activa
        $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();

        if (!$gestionActiva) {
            return response()->json([
                'message' => 'No hay gestión académica activa'
            ], 422);
        }

        $asignacion->update([
            'profesor_id' => $request->profesor_id,
            'curso_id' => $request->curso_id,
            'materia_id' => $request->materia_id,
            'gestion_academica_id' => $gestionActiva->id,
        ]);

        return response()->json([
            'message' => 'Asignación actualizada exitosamente',
            'asignacion' => $asignacion
        ]);
    }

    /**
     * Eliminar una asignación
     */
    public function destroy($id)
    {
        $asignacion = AsignacionProfesor::findOrFail($id);
        $asignacion->delete();

        return response()->json([
            'message' => 'Asignación eliminada exitosamente'
        ]);
    }

    /**
     * Obtener asignaciones de un profesor
     */
    public function porProfesor($profesorId)
    {
        // Obtener gestión activa
        $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();

        $query = AsignacionProfesor::with(['curso:id,grado,paralelo', 'materia:id,nombre'])
            ->where('profesor_id', $profesorId);

        // Filtrar por gestión activa
        if ($gestionActiva) {
            $query->where('gestion_academica_id', $gestionActiva->id);
        }

        $asignaciones = $query->get();

        return response()->json($asignaciones);
    }

    /**
     * Obtener asignaciones de un curso
     */
    public function porCurso($cursoId)
    {
        // Obtener gestión activa
        $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();

        $query = AsignacionProfesor::with(['profesor:id,nombre', 'materia:id,nombre'])
            ->where('curso_id', $cursoId);

        // Filtrar por gestión activa
        if ($gestionActiva) {
            $query->where('gestion_academica_id', $gestionActiva->id);
        }

        $asignaciones = $query->get();

        return response()->json($asignaciones);
    }
}
