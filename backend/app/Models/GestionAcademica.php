<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GestionAcademica extends Model
{
    use HasFactory;

    protected $table = 'gestion_academica';

    protected $fillable = [
        'anio',
        'fecha_inicio',
        'fecha_fin',
        'activo',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'activo' => 'boolean',
        'anio' => 'integer'
    ];

    // Relaciones
    public function trimestres()
    {
        return $this->hasMany(Trimestre::class);
    }

    public function cursos()
    {
        return $this->hasMany(Curso::class);
    }

    public function matriculas()
    {
        return $this->hasMany(Matricula::class);
    }

    public function asignacionesProfesores()
    {
        return $this->hasMany(AsignacionProfesor::class);
    }

    public function promediosAnuales()
    {
        return $this->hasMany(PromedioAnual::class);
    }

    // Scopes
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }
}
