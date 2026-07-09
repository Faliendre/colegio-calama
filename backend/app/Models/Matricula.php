<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Matricula extends Model
{
    use HasFactory;

    protected $fillable = [
        'alumno_id',
        'curso_id',
        'gestion_academica_id',
        'fecha_matricula',
        'estado'
    ];

    protected $casts = [
        'fecha_matricula' => 'date',
    ];

    // Relaciones
    public function alumno()
    {
        return $this->belongsTo(Alumno::class);
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    public function gestionAcademica()
    {
        return $this->belongsTo(GestionAcademica::class);
    }
}
