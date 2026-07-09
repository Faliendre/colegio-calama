<?php

namespace App\Http\Controllers;

use App\Models\GestionAcademica;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GestionAcademicaController extends Controller
{
    public function index()
    {
        $gestiones = GestionAcademica::orderBy('anio', 'desc')->get();
        return response()->json($gestiones);
    }

    public function store(Request $request)
    {
        $request->validate([
            'anio' => 'required|integer|unique:gestion_academica,anio',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
        ]);

        $gestion = GestionAcademica::create([
            'anio' => $request->anio,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin' => $request->fecha_fin,
            'activo' => false
        ]);

        return response()->json([
            'message' => 'Gestión académica creada exitosamente',
            'gestion' => $gestion
        ], 201);
    }

    public function activar($id)
    {
        DB::beginTransaction();
        try {
            GestionAcademica::query()->update(['activo' => false]);

            $gestion = GestionAcademica::findOrFail($id);
            $gestion->activo = true;
            $gestion->save();

            DB::commit();

            return response()->json([
                'message' => 'Gestión académica activada exitosamente',
                'gestion' => $gestion
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function cerrar($id)
    {
        $gestion = GestionAcademica::findOrFail($id);
        $gestion->activo = false;
        $gestion->save();

        return response()->json([
            'message' => 'Gestión académica cerrada exitosamente',
            'gestion' => $gestion
        ]);
    }

    public function getActiva()
    {
        $gestion = GestionAcademica::where('activo', true)->first();

        if (!$gestion) {
            return response()->json(['message' => 'No hay gestión activa'], 404);
        }

        return response()->json($gestion);
    }
}
