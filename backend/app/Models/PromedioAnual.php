<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromedioAnual extends Model
{
    use HasFactory;

    protected $table = 'promedios_anuales';

    protected $fillable = [
        'alumno_id',
        'gestion_academica_id',
        'promedio_anual',
        'posicion_general',
    ];

    protected $casts = [
        'promedio_anual' => 'decimal:2',
    ];

    // Relaciones
    public function alumno()
    {
        return $this->belongsTo(Alumno::class);
    }

    public function gestionAcademica()
    {
        return $this->belongsTo(GestionAcademica::class);
    }
}
