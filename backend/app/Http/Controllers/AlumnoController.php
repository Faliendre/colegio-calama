<?php

namespace App\Http\Controllers;

use App\Models\Alumno;
use Illuminate\Http\Request;

class AlumnoController extends Controller
{
    /**
     * Listar todos los alumnos
     */
    public function index(Request $request)
    {
        $query = Alumno::query();

        // Filtrar solo activos si se solicita
        if ($request->has('activos') && $request->activos == 'true') {
            $query->activos();
        }

        // Búsqueda por nombre o código RUDE
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('apellido_paterno', 'like', "%{$search}%")
                  ->orWhere('apellido_materno', 'like', "%{$search}%")
                  ->orWhere('codigo_rude', 'like', "%{$search}%")
                  ->orWhere('ci', 'like', "%{$search}%");
            });
        }

        $alumnos = $query->orderBy('apellido_paterno')
            ->orderBy('apellido_materno')
            ->orderBy('nombre')
            ->get()
            ->map(function ($alumno) {
                return [
                    'id' => $alumno->id,
                    'codigo_rude' => $alumno->codigo_rude,
                    'ci' => $alumno->ci,
                    'nombre_completo' => $alumno->nombre_completo,
                    'nombre' => $alumno->nombre,
                    'apellido_paterno' => $alumno->apellido_paterno,
                    'apellido_materno' => $alumno->apellido_materno,
                    'fecha_nacimiento' => $alumno->fecha_nacimiento?->format('Y-m-d'),
                    'genero' => $alumno->genero,
                    'direccion' => $alumno->direccion,
                    'telefono' => $alumno->telefono,
                    'activo' => $alumno->activo,
                    'created_at' => $alumno->created_at,
                ];
            });

        return response()->json($alumnos);
    }

    /**
     * Crear un nuevo alumno
     */
    public function store(Request $request)
    {
        $request->validate([
            'codigo_rude' => 'required|string|unique:alumnos,codigo_rude',
            'ci' => 'nullable|string|unique:alumnos,ci',
            'nombre' => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',
            'apellido_materno' => 'required|string|max:255',
            'fecha_nacimiento' => 'required|date',
            'genero' => 'required|in:M,F',
            'direccion' => 'nullable|string|max:500',
            'telefono' => 'nullable|string|max:20',
            'activo' => 'boolean',
        ]);

        $alumno = Alumno::create($request->all());

        return response()->json([
            'message' => 'Alumno registrado exitosamente',
            'alumno' => $alumno
        ], 201);
    }

    /**
     * Mostrar un alumno específico
     */
    public function show($id)
    {
        $alumno = Alumno::with(['matriculas.curso'])->findOrFail($id);
        return response()->json($alumno);
    }

    /**
     * Actualizar un alumno
     */
    public function update(Request $request, $id)
    {
        $alumno = Alumno::findOrFail($id);

        $request->validate([
            'codigo_rude' => 'required|string|unique:alumnos,codigo_rude,' . $id,
            'ci' => 'nullable|string|unique:alumnos,ci,' . $id,
            'nombre' => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',
            'apellido_materno' => 'required|string|max:255',
            'fecha_nacimiento' => 'required|date',
            'genero' => 'required|in:M,F',
            'direccion' => 'nullable|string|max:500',
            'telefono' => 'nullable|string|max:20',
            'activo' => 'boolean',
        ]);

        $alumno->update($request->all());

        return response()->json([
            'message' => 'Alumno actualizado exitosamente',
            'alumno' => $alumno
        ]);
    }

    /**
     * Eliminar un alumno (soft delete o inactivar)
     */
    public function destroy($id)
    {
        $alumno = Alumno::findOrFail($id);

        // Opción 1: Inactivar en lugar de eliminar
        $alumno->update(['activo' => false]);

        // Opción 2: Eliminar físicamente (descomenta si lo prefieres)
        // $alumno->delete();

        return response()->json([
            'message' => 'Alumno desactivado exitosamente'
        ]);
    }
}
