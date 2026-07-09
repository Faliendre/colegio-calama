<?php

namespace App\Http\Controllers;

use App\Models\Matricula;
use App\Models\Alumno;
use App\Models\Curso;
use Illuminate\Http\Request;

class MatriculaController extends Controller
{
    /**
     * Listar todas las matrículas
     */
    public function index(Request $request)
    {
        $query = Matricula::with(['alumno', 'curso', 'gestionAcademica']);

        // Filtrar por curso
        if ($request->has('curso_id')) {
            $query->where('curso_id', $request->curso_id);
        }

        // Filtrar por estado
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        $matriculas = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($matricula) {
                return [
                    'id' => $matricula->id,
                    'alumno_id' => $matricula->alumno_id,
                    'alumno' => $matricula->alumno->nombre_completo,
                    'curso_id' => $matricula->curso_id,
                    'curso' => $matricula->curso->nombre_completo,
                    'fecha_matricula' => $matricula->fecha_matricula?->format('Y-m-d'),
                    'estado' => $matricula->estado,
                    'gestion_academica_id' => $matricula->gestion_academica_id,
                ];
            });

        return response()->json($matriculas);
    }

    /**
     * Matricular un alumno a un curso
     */
    public function store(Request $request)
    {
        $request->validate([
            'alumno_id' => 'required|exists:alumnos,id',
            'curso_id' => 'required|exists:cursos,id',
            'gestion_academica_id' => 'required|exists:gestion_academica,id',
            'fecha_matricula' => 'required|date',
        ]);

        // Verificar que el alumno no esté ya matriculado en ese curso
        $existe = Matricula::where('alumno_id', $request->alumno_id)
            ->where('curso_id', $request->curso_id)
            ->where('gestion_academica_id', $request->gestion_academica_id)
            ->where('estado', 'activo')
            ->exists();

        if ($existe) {
            return response()->json([
                'message' => 'El alumno ya está matriculado en este curso'
            ], 422);
        }

        // Verificar capacidad del curso
        $curso = Curso::findOrFail($request->curso_id);
        $matriculados = Matricula::where('curso_id', $request->curso_id)
            ->where('estado', 'activo')
            ->count();

        if ($matriculados >= $curso->capacidad_maxima) {
            return response()->json([
                'message' => 'El curso ha alcanzado su capacidad máxima'
            ], 422);
        }

        $matricula = Matricula::create([
            'alumno_id' => $request->alumno_id,
            'curso_id' => $request->curso_id,
            'gestion_academica_id' => $request->gestion_academica_id,
            'fecha_matricula' => $request->fecha_matricula,
            'estado' => 'activo'
        ]);

        return response()->json([
            'message' => 'Matrícula registrada exitosamente',
            'matricula' => $matricula
        ], 201);
    }

    /**
     * Cambiar estado de matrícula
     */
    public function updateEstado(Request $request, $id)
    {
        $matricula = Matricula::findOrFail($id);

        $request->validate([
            'estado' => 'required|in:activo,retirado,trasladado'
        ]);

        $matricula->update(['estado' => $request->estado]);

        return response()->json([
            'message' => 'Estado actualizado exitosamente',
            'matricula' => $matricula
        ]);
    }

    /**
     * Eliminar matrícula
     */
    public function destroy($id)
    {
        $matricula = Matricula::findOrFail($id);
        $matricula->delete();

        return response()->json([
            'message' => 'Matrícula eliminada exitosamente'
        ]);
    }
}
