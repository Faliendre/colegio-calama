<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Agregar gestion_academica_id a matriculas
        Schema::table('matriculas', function (Blueprint $table) {
            $table->unsignedBigInteger('gestion_academica_id')->nullable()->after('curso_id');
            $table->foreign('gestion_academica_id')->references('id')->on('gestion_academica')->onDelete('cascade');
        });

        // Actualizar matrículas existentes con la gestión activa
        $gestionActiva = DB::table('gestion_academica')->where('activo', true)->first();
        if ($gestionActiva) {
            DB::table('matriculas')->update(['gestion_academica_id' => $gestionActiva->id]);
        }
    }

    public function down(): void
    {
        Schema::table('matriculas', function (Blueprint $table) {
            $table->dropForeign(['gestion_academica_id']);
            $table->dropColumn('gestion_academica_id');
        });
    }
};
