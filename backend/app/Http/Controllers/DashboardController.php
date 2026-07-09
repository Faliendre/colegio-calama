<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Curso;
use App\Models\Alumno;  // ← Modelo Alumno
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function getStats()
    {
        // Contar usuarios por rol (solo quienes acceden al sistema)
        $totalUsers = User::count();

        // Alumnos en tabla separada
        $students = Alumno::count();  // ← Usar tabla alumnos

        // Profesores
        $teachers = User::where('role', 'profesor')->count();

        // Asesores
        $advisors = User::where('role', 'asesor')->count();

        // Contar cursos activos
        $activeCourses = Curso::count();

        // Consultar actividad reciente (Solo acciones realizadas por el Administrador)
        $recentActivity = [];

        // 1. Matrículas recientes
        try {
            $matriculas = \App\Models\Matricula::with(['alumno', 'curso'])
                ->orderBy('created_at', 'desc')
                ->limit(3)
                ->get();
            foreach ($matriculas as $m) {
                if ($m->alumno && $m->curso) {
                    $recentActivity[] = [
                        'title' => 'Nueva Matrícula',
                        'description' => "Matriculaste a {$m->alumno->nombre_completo} en {$m->curso->grado}° \"{$m->curso->paralelo}\"",
                        'type' => 'matricula',
                        'created_at' => $m->created_at ? $m->created_at->toIso8601String() : now()->toIso8601String(),
                        'time_ago' => $m->created_at ? $m->created_at->diffForHumans() : 'Recientemente',
                        'icon' => 'user-plus',
                        'color' => '#10b981' // verde
                    ];
                }
            }
        } catch (\Exception $e) {
        }

        // 2. Usuarios registrados recientemente
        try {
            $usuarios = \App\Models\User::orderBy('created_at', 'desc')
                ->limit(3)
                ->get();
            foreach ($usuarios as $u) {
                $nombreCompleto = $u->nombre . ' ' . $u->apellido_paterno . ' ' . $u->apellido_materno;
                $rolNombre = ucfirst($u->role);
                $recentActivity[] = [
                    'title' => 'Usuario Registrado',
                    'description' => "Registraste al usuario {$nombreCompleto} con el rol {$rolNombre}",
                    'type' => 'sistema',
                    'created_at' => $u->created_at ? $u->created_at->toIso8601String() : now()->toIso8601String(),
                    'time_ago' => $u->created_at ? $u->created_at->diffForHumans() : 'Recientemente',
                    'icon' => 'user-plus',
                    'color' => '#3b82f6' // azul
                ];
            }
        } catch (\Exception $e) {
        }

        // 3. Cursos creados recientemente
        try {
            $cursos = \App\Models\Curso::orderBy('created_at', 'desc')
                ->limit(3)
                ->get();
            foreach ($cursos as $c) {
                $recentActivity[] = [
                    'title' => 'Curso Creado',
                    'description' => "Creaste el curso {$c->grado}° \"{$c->paralelo}\"",
                    'type' => 'sistema',
                    'created_at' => $c->created_at ? $c->created_at->toIso8601String() : now()->toIso8601String(),
                    'time_ago' => $c->created_at ? $c->created_at->diffForHumans() : 'Recientemente',
                    'icon' => 'check-circle',
                    'color' => '#f59e0b' // amarillo/naranja
                ];
            }
        } catch (\Exception $e) {
        }

        // Ordenar por fecha de creación desc
        usort($recentActivity, function($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });

        // Limitar a las 5 actividades más recientes
        $recentActivity = array_slice($recentActivity, 0, 5);

        // Si no hay actividad reciente, agregar una por defecto
        if (empty($recentActivity)) {
            $recentActivity[] = [
                'title' => 'Sistema Listo',
                'description' => 'El sistema está en línea y funcionando correctamente.',
                'type' => 'sistema',
                'created_at' => now()->toIso8601String(),
                'time_ago' => 'Hoy',
                'icon' => 'check-circle',
                'color' => '#10b981'
            ];
        }

        return response()->json([
            'total_users' => $totalUsers,
            'students' => $students,
            'teachers' => $teachers,
            'advisors' => $advisors,
            'active_courses' => $activeCourses,
            'recent_activity' => $recentActivity
        ]);
    }
}
