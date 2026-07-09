<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trimestre extends Model
{
    use HasFactory;

    protected $fillable = [
        'gestion_academica_id',
        'numero',
        'nombre',
        'fecha_inicio',
        'fecha_fin',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];

    // Relaciones
    public function gestionAcademica()
    {
        return $this->belongsTo(GestionAcademica::class);
    }

    public function criteriosEvaluacion()
    {
        return $this->hasMany(CriterioEvaluacion::class);
    }

    public function notasTrimestrales()
    {
        return $this->hasMany(NotaTrimestral::class);
    }
}
