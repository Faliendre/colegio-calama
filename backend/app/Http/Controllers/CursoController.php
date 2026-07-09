<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use App\Models\GestionAcademica;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CursoController extends Controller
{
    /**
     * Listar todos los cursos
     */
    public function index(Request $request)
    {
        // Obtener gestión activa para contar matrículas
        $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();

        $cursos = Curso::with(['asesor:id,nombre'])
            ->orderBy('grado')
            ->orderBy('paralelo')
            ->get()
            ->map(function ($curso) use ($gestionActiva) {
                // Contar solo matrículas de la gestión activa
                $estudiantesInscritos = $gestionActiva
                    ? $curso->matriculas()
                    ->where('gestion_academica_id', $gestionActiva->id)
                    ->where('estado', 'activo')
                    ->count()
                    : 0;

                return [
                    'id' => $curso->id,
                    'grado' => $curso->grado,
                    'paralelo' => $curso->paralelo,
                    'nombre_completo' => $curso->nombre_completo,
                    'capacidad_maxima' => $curso->capacidad_maxima ?? 45,
                    'estudiantes_inscritos' => $estudiantesInscritos,
                    'asesor' => $curso->asesor ? $curso->asesor->nombre : 'Sin asignar',
                    'asesor_id' => $curso->asesor_id,
                    'created_at' => $curso->created_at,
                ];
            });

        return response()->json($cursos);
    }

    /**
     * Crear un nuevo curso
     */
    public function store(Request $request)
    {
        $request->validate([
            'grado' => 'required|string|in:1ro,2do,3ro,4to,5to,6to',
            'paralelo' => 'required|string|in:A,B,C,D,E',
            'capacidad_maxima' => 'nullable|integer|min:1|max:50',
            'asesor_id' => 'nullable|exists:users,id',
        ]);

        // Verificar que no exista ya el curso
        $existe = Curso::where('grado', $request->grado)
            ->where('paralelo', $request->paralelo)
            ->exists();

        if ($existe) {
            return response()->json([
                'message' => 'Este curso ya existe'
            ], 422);
        }

        $data = $request->all();
        $data['capacidad_maxima'] = $request->capacidad_maxima ?? 45;
        $data['gestion_academica_id'] = null; // Los cursos son permanentes

        $curso = Curso::create($data);

        return response()->json([
            'message' => 'Curso creado exitosamente',
            'curso' => $curso
        ], 201);
    }

    /**
     * Mostrar un curso específico
     */
    public function show($id)
    {
        $curso = Curso::with(['asesor', 'matriculas'])->findOrFail($id);
        return response()->json($curso);
    }

    /**
     * Actualizar un curso
     */
    public function update(Request $request, $id)
    {
        $curso = Curso::findOrFail($id);

        $request->validate([
            'grado' => 'required|string|in:1ro,2do,3ro,4to,5to,6to',
            'paralelo' => 'required|string|in:A,B,C,D,E',
            'capacidad_maxima' => 'nullable|integer|min:1|max:50',
            'asesor_id' => 'nullable|exists:users,id',
        ]);

        $curso->update($request->all());

        return response()->json([
            'message' => 'Curso actualizado exitosamente',
            'curso' => $curso
        ]);
    }

    /**
     * Eliminar un curso
     */
    public function destroy($id)
    {
        $curso = Curso::findOrFail($id);

        // Verificar si tiene estudiantes matriculados en CUALQUIER gestión
        if ($curso->matriculas()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar el curso porque tiene estudiantes matriculados (histórico)'
            ], 422);
        }

        $curso->delete();

        return response()->json([
            'message' => 'Curso eliminado exitosamente'
        ]);
    }
}
