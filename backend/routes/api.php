<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CursoController;
use App\Http\Controllers\AlumnoController;
use App\Http\Controllers\MatriculaController;
use App\Http\Controllers\MateriaController;
use App\Http\Controllers\AsignacionProfesorController;
use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\Api\CalificacionesController;
use App\Http\Controllers\ProfesorController;
use App\Http\Controllers\AsesorController;
use App\Http\Controllers\GestionAcademicaController;
use App\Http\Controllers\PromocionAlumnosController;
use App\Http\Controllers\ActaCalificacionesController;


// Rutas públicas
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas (requieren autenticación)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Filtro estricto para operaciones de Administrador
    Route::group(['middleware' => function ($request, $next) {
        if ($request->user() && $request->user()->role === 'administrador') {
            return $next($request);
        }
        return response()->json(['message' => 'Acceso denegado. Se requieren permisos de administrador.'], 403);
    }], function () {
        Route::get('/admin/dashboard', function () {
            return response()->json(['message' => 'Dashboard de administrador']);
        });

        Route::apiResource('users', UserController::class);
        Route::apiResource('cursos', CursoController::class);
        Route::apiResource('alumnos', AlumnoController::class);
        Route::apiResource('matriculas', MatriculaController::class);
        Route::put('matriculas/{id}/estado', [MatriculaController::class, 'updateEstado']);
        Route::apiResource('materias', MateriaController::class);
        Route::apiResource('asignaciones-profesor', AsignacionProfesorController::class);
        Route::get('asignaciones-profesor/por-profesor/{profesorId}', [AsignacionProfesorController::class, 'porProfesor']);
        Route::get('asignaciones-profesor/por-curso/{cursoId}', [AsignacionProfesorController::class, 'porCurso']);
        Route::get('reporte-asistencias', [AsistenciaController::class, 'reporte']);

        // Gestión Académica (Modificaciones)
        Route::post('/gestiones-academicas', [GestionAcademicaController::class, 'store']);
        Route::put('/gestiones-academicas/{id}/activar', [GestionAcademicaController::class, 'activar']);
        Route::put('/gestiones-academicas/{id}/cerrar', [GestionAcademicaController::class, 'cerrar']);

        // Promoción de Alumnos
        Route::get('/promocion/elegibles', [PromocionAlumnosController::class, 'obtenerElegibles']);
        Route::post('/promocion/ejecutar', [PromocionAlumnosController::class, 'ejecutarPromocion']);

        // Actas de Calificaciones
        Route::post('/acta-calificaciones', [ActaCalificacionesController::class, 'generarActa']);
    });

    // Rutas compartidas/generales para otros roles autenticados
    Route::get('/calificaciones/alumnos', [CalificacionesController::class, 'getAlumnos']);
    Route::get('/calificaciones/reporte/{alumnoId}', [CalificacionesController::class, 'getReporte']);
    
    Route::get('/gestiones-academicas', [GestionAcademicaController::class, 'index']);
    Route::get('/gestiones-academicas/activa', [GestionAcademicaController::class, 'getActiva']);



    // Rutas solo para Profesor
    Route::middleware('role:profesor')->group(function () {
        Route::get('/profesor/dashboard', function () {
            return response()->json(['message' => 'Dashboard de profesor']);
        });
    });

    // Rutas solo para Asesor
    Route::middleware('role:asesor')->group(function () {
        Route::get('/asesor/dashboard', function () {
            return response()->json(['message' => 'Dashboard de asesor']);
        });
    });
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
        Route::get('dashboard/admin/stats', [DashboardController::class, 'getAdminStats']);
        Route::get('dashboard/profesor/stats', [DashboardController::class, 'getProfesorStats']);
        Route::get('dashboard/asesor/stats', [DashboardController::class, 'getAsesorStats']);
    });
    // Rutas del profesor
    Route::middleware(['auth:sanctum'])->prefix('profesor')->group(function () {
        Route::get('/dashboard', [ProfesorController::class, 'dashboard']);
        Route::get('/mis-cursos', [ProfesorController::class, 'misCursos']);
        Route::get('/curso/{cursoId}/alumnos', [ProfesorController::class, 'alumnosPorCurso']);

        // Asistencia
        Route::post('/asistencia/registrar', [ProfesorController::class, 'registrarAsistencia']);
        Route::get('/asistencia/curso/{cursoId}', [ProfesorController::class, 'verAsistencia']);
        Route::get('/asistencia', [ProfesorController::class, 'getAsistenciasPorFecha']);
        Route::put('/asistencia/{id}', [ProfesorController::class, 'editarAsistencia']);

        // Calificaciones
        Route::post('/criterio/crear', [ProfesorController::class, 'crearCriterio']);
        Route::post('/calificaciones/registrar', [ProfesorController::class, 'registrarCalificacion']);
        Route::get('/calificaciones/curso/{cursoId}', [ProfesorController::class, 'verCalificaciones']);
        Route::get('/trimestres', [ProfesorController::class, 'getTrimestres']);
        Route::get('/criterios', [ProfesorController::class, 'getCriterios']);
        Route::get('/calificaciones', [ProfesorController::class, 'getCalificacionesPorCriterio']);
        Route::put('/nota/{id}', [ProfesorController::class, 'editarNota']);
        // Promedios
        Route::get('/promedios', [ProfesorController::class, 'getPromediosTrimestre']);
    });
    Route::middleware(['auth:sanctum'])->prefix('profesor')->group(function () {
        // ... rutas existentes
        Route::get('/criterios', [ProfesorController::class, 'getCriterios']);
    });
    // Rutas del Asesor
    Route::middleware(['auth:sanctum'])->prefix('asesor')->group(function () {
        Route::get('/dashboard', [AsesorController::class, 'dashboard']);
        Route::get('/estudiantes', [AsesorController::class, 'getEstudiantes']);
        Route::get('/reporte-notas', [AsesorController::class, 'getReporteNotas']);
        Route::get('/reporte-asistencia', [AsesorController::class, 'getReporteAsistencia']);
        Route::get('/estudiante/{alumnoId}', [AsesorController::class, 'getFichaEstudiante']);
    });
});
