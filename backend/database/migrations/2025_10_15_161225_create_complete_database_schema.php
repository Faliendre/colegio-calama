<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Modificar tabla users
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'email')) {
                $table->dropColumn('email');
            }
            if (Schema::hasColumn('users', 'name')) {
                $table->dropColumn('name');
            }

            $table->string('username', 50)->unique()->after('id');
            $table->string('nombre', 100)->after('password');
            $table->string('apellido_paterno', 100)->after('nombre');
            $table->string('apellido_materno', 100)->after('apellido_paterno');
            $table->enum('role', ['administrador', 'profesor', 'asesor'])->after('apellido_materno');
            $table->boolean('activo')->default(true)->after('role');
        });

        // 2. Crear tabla gestion_academica
        Schema::create('gestion_academica', function (Blueprint $table) {
            $table->id();
            $table->integer('anio');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // 3. Crear tabla trimestres
        Schema::create('trimestres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gestion_academica_id')->constrained('gestion_academica')->onDelete('cascade');
            $table->integer('numero');
            $table->string('nombre', 50);
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->timestamps();
        });

        // 4. Crear tabla materias
        Schema::create('materias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->string('codigo', 20);
            $table->timestamps();
        });

        // 5. Crear tabla cursos
        Schema::create('cursos', function (Blueprint $table) {
            $table->id();
            $table->enum('grado', ['1ro', '2do', '3ro', '4to', '5to', '6to']);
            $table->enum('paralelo', ['A', 'B', 'C', 'D', 'E']);
            $table->foreignId('gestion_academica_id')->constrained('gestion_academica')->onDelete('cascade');
            $table->foreignId('asesor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        // 6. Crear tabla alumnos
        Schema::create('alumnos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_rude', 50)->unique();
            $table->string('nombre', 100);
            $table->string('apellido_paterno', 100);
            $table->string('apellido_materno', 100);
            $table->date('fecha_nacimiento');
            $table->enum('genero', ['M', 'F']);
            $table->text('direccion')->nullable();
            $table->string('telefono', 20)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // 7. Crear tabla matriculas
        Schema::create('matriculas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained('alumnos')->onDelete('cascade');
            $table->foreignId('curso_id')->constrained('cursos')->onDelete('cascade');
            $table->foreignId('gestion_academica_id')->constrained('gestion_academica')->onDelete('cascade');
            $table->date('fecha_matricula');
            $table->enum('estado', ['activo', 'retirado', 'trasladado'])->default('activo');
            $table->timestamps();
        });

        // 8. Crear tabla horarios
        Schema::create('horarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('curso_id')->constrained('cursos')->onDelete('cascade');
            $table->foreignId('materia_id')->constrained('materias')->onDelete('cascade');
            $table->integer('dia_semana');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->timestamps();
        });

        // 9. Crear tabla asignaciones_profesor
        Schema::create('asignaciones_profesor', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profesor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('curso_id')->constrained('cursos')->onDelete('cascade');
            $table->foreignId('materia_id')->constrained('materias')->onDelete('cascade');
            $table->foreignId('gestion_academica_id')->constrained('gestion_academica')->onDelete('cascade');
            $table->timestamps();
        });

        // 10. Crear tabla criterios_evaluacion
        Schema::create('criterios_evaluacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asignacion_profesor_id')->constrained('asignaciones_profesor')->onDelete('cascade');
            $table->foreignId('trimestre_id')->constrained('trimestres')->onDelete('cascade');
            $table->string('nombre', 100);
            $table->decimal('ponderacion', 5, 2);
            $table->date('fecha_creacion');
            $table->timestamps();
        });

        // 11. Crear tabla notas
        Schema::create('notas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('criterio_evaluacion_id')->constrained('criterios_evaluacion')->onDelete('cascade');
            $table->foreignId('alumno_id')->constrained('alumnos')->onDelete('cascade');
            $table->decimal('nota', 5, 2);
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });

        // 12. Crear tabla notas_trimestrales
        Schema::create('notas_trimestrales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('matricula_id')->constrained('matriculas')->onDelete('cascade');
            $table->foreignId('asignacion_profesor_id')->constrained('asignaciones_profesor')->onDelete('cascade');
            $table->foreignId('trimestre_id')->constrained('trimestres')->onDelete('cascade');
            $table->decimal('nota_final', 5, 2);
            $table->boolean('aprobado');
            $table->timestamps();
        });

        // 13. Crear tabla asistencias
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained('alumnos')->onDelete('cascade');
            $table->foreignId('asignacion_profesor_id')->constrained('asignaciones_profesor')->onDelete('cascade');
            $table->date('fecha');
            $table->enum('estado', ['presente', 'ausente', 'licencia']);
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });

        // 14. Crear tabla promedios_anuales
        Schema::create('promedios_anuales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained('alumnos')->onDelete('cascade');
            $table->foreignId('gestion_academica_id')->constrained('gestion_academica')->onDelete('cascade');
            $table->decimal('promedio_anual', 5, 2);
            $table->integer('posicion_general')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promedios_anuales');
        Schema::dropIfExists('asistencias');
        Schema::dropIfExists('notas_trimestrales');
        Schema::dropIfExists('notas');
        Schema::dropIfExists('criterios_evaluacion');
        Schema::dropIfExists('asignaciones_profesor');
        Schema::dropIfExists('horarios');
        Schema::dropIfExists('matriculas');
        Schema::dropIfExists('alumnos');
        Schema::dropIfExists('cursos');
        Schema::dropIfExists('materias');
        Schema::dropIfExists('trimestres');
        Schema::dropIfExists('gestion_academica');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'nombre', 'apellido_paterno', 'apellido_materno', 'role', 'activo']);
            $table->string('name');
            $table->string('email')->unique();
        });
    }
};
