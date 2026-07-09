<?php

namespace App\Http\Controllers;

use App\Models\Materia;
use Illuminate\Http\Request;

class MateriaController extends Controller
{
    /**
     * Listar todas las materias
     */
    public function index()
    {
        $materias = Materia::orderBy('nombre')->get();

        return response()->json($materias);
    }

    /**
     * Crear una nueva materia
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:materias',
            'codigo' => 'required|string|max:20|unique:materias',
        ]);

        $materia = Materia::create($request->all());

        return response()->json([
            'message' => 'Materia creada exitosamente',
            'materia' => $materia
        ], 201);
    }

    /**
     * Mostrar una materia específica
     */
    public function show($id)
    {
        $materia = Materia::with('asignaciones')->findOrFail($id);
        return response()->json($materia);
    }

    /**
     * Actualizar una materia
     */
    public function update(Request $request, $id)
    {
        $materia = Materia::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:255|unique:materias,nombre,' . $id,
            'codigo' => 'required|string|max:20|unique:materias,codigo,' . $id,
        ]);

        $materia->update($request->all());

        return response()->json([
            'message' => 'Materia actualizada exitosamente',
            'materia' => $materia
        ]);
    }

    /**
     * Eliminar una materia
     */
    public function destroy($id)
    {
        $materia = Materia::findOrFail($id);
        $materia->delete();

        return response()->json([
            'message' => 'Materia eliminada exitosamente'
        ]);
    }
}
