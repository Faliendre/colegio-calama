<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    use HasFactory;

    protected $fillable = [
        'grado',
        'paralelo',
        'capacidad_maxima',
        'gestion_academica_id',
        'asesor_id',
    ];

    protected $casts = [
        'capacidad_maxima' => 'integer',
    ];

    // Relaciones
    public function gestionAcademica()
    {
        return $this->belongsTo(GestionAcademica::class);
    }

    public function asesor()
    {
        return $this->belongsTo(User::class, 'asesor_id');
    }

    public function matriculas()
    {
        return $this->hasMany(Matricula::class);
    }

    public function horarios()
    {
        return $this->hasMany(Horario::class);
    }

    public function asignacionesProfesores()
    {
        return $this->hasMany(AsignacionProfesor::class);
    }

    // Accessors
    public function getNombreCompletoAttribute()
    {
        return $this->grado . ' "' . $this->paralelo . '"';
    }

    public function getEstudiantesInscritosAttribute()
    {
        return $this->matriculas()->count();
    }

    public function hasCupoDisponible()
    {
        return $this->getEstudiantesInscritosAttribute() < $this->capacidad_maxima;
    }
}
