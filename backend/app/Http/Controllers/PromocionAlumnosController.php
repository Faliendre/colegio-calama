<?php

namespace App\Http\Controllers;

use App\Models\GestionAcademica;
use App\Models\Matricula;
use App\Models\Alumno;
use App\Models\Curso;
use App\Models\Nota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PromocionAlumnosController extends Controller
{
    /**
     * Obtener alumnos elegibles para promoción
     */
    public function obtenerElegibles(Request $request)
    {
        $gestionActual = GestionAcademica::where('activo', true)->first();

        if (!$gestionActual) {
            return response()->json(['error' => 'No hay gestión activa'], 404);
        }

        // Obtener todas las matrículas de la gestión actual
        $matriculas = Matricula::with(['alumno', 'curso'])
            ->where('gestion_academica_id', $gestionActual->id)
            ->where('estado', 'activo')
            ->get();

        $resultados = [];

        foreach ($matriculas as $matricula) {
            // Calcular promedio del alumno
            $notas = Nota::where('alumno_id', $matricula->alumno_id)->get();

            if ($notas->isEmpty()) {
                $promedio = 0;
            } else {
                $promedio = $notas->avg('nota');
            }

            $aprobado = $promedio >= 51; // ← CORREGIDO: 51 es aprobado

            $resultados[] = [
                'matricula_id' => $matricula->id,
                'alumno_id' => $matricula->alumno_id,
                'alumno_nombre' => $matricula->alumno->nombre . ' ' . $matricula->alumno->apellido_paterno,
                'codigo_rude' => $matricula->alumno->codigo_rude,
                'curso_actual' => $matricula->curso->nombre_completo,
                'curso_actual_id' => $matricula->curso->id,
                'promedio' => round($promedio, 2),
                'aprobado' => $aprobado,
                'accion' => $aprobado ? 'Promover' : 'Repetir curso'
            ];
        }

        return response()->json([
            'gestion_actual' => $gestionActual,
            'alumnos' => $resultados
        ]);
    }

    /**
     * Ejecutar promoción de alumnos a nueva gestión
     */
    public function ejecutarPromocion(Request $request)
    {
        $request->validate([
            'nueva_gestion_id' => 'required|exists:gestion_academica,id',
            'alumnos' => 'required|array'
        ]);

        DB::beginTransaction();
        try {
            $nuevaGestion = GestionAcademica::findOrFail($request->nueva_gestion_id);
            $promocionados = 0;
            $repetidores = 0;

            foreach ($request->alumnos as $alumnoData) {
                $alumnoId = $alumnoData['alumno_id'];
                $cursoActualId = $alumnoData['curso_actual_id'];
                $aprobado = $alumnoData['aprobado'];

                // Determinar curso para nueva gestión
                if ($aprobado) {
                    // Buscar curso superior
                    $cursoSuperior = $this->obtenerCursoSuperior($cursoActualId);
                    $nuevoCursoId = $cursoSuperior ? $cursoSuperior->id : $cursoActualId;
                    $promocionados++;
                } else {
                    // Repetir mismo curso
                    $nuevoCursoId = $cursoActualId;
                    $repetidores++;
                }

                // Crear nueva matrícula en la nueva gestión
                Matricula::create([
                    'alumno_id' => $alumnoId,
                    'curso_id' => $nuevoCursoId,
                    'gestion_academica_id' => $nuevaGestion->id,
                    'fecha_matricula' => now(),
                    'estado' => 'activo'
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Promoción ejecutada exitosamente',
                'promocionados' => $promocionados,
                'repetidores' => $repetidores
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Obtener curso superior
     */
    private function obtenerCursoSuperior($cursoActualId)
    {
        $cursoActual = Curso::find($cursoActualId);

        if (!$cursoActual) {
            return null;
        }

        // Extraer el número del GRADO (no del nombre)
        // Ej: "1ro" → 1, "2do" → 2, "3ro" → 3
        preg_match('/(\d+)/', $cursoActual->grado, $matches);

        if (empty($matches)) {
            return null;
        }

        $numeroActual = (int)$matches[1];

        // Si es 6to, no hay curso superior
        if ($numeroActual >= 6) {
            return null;
        }

        $numeroSuperior = $numeroActual + 1;

        // Construir el grado superior: 1ro → 2do, 2do → 3ro, etc.
        $gradosSufijos = [
            1 => '1ro',
            2 => '2do',
            3 => '3ro',
            4 => '4to',
            5 => '5to',
            6 => '6to'
        ];

        $gradoSuperior = $gradosSufijos[$numeroSuperior] ?? null;

        if (!$gradoSuperior) {
            return null;
        }

        // Buscar curso con el mismo paralelo
        return Curso::where('grado', $gradoSuperior)
            ->where('paralelo', $cursoActual->paralelo)
            ->first();
    }
}
