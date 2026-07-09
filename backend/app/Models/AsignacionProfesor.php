<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AsignacionProfesor extends Model
{
    use HasFactory;

    protected $table = 'asignaciones_profesor';

    protected $fillable = [
        'profesor_id',
        'curso_id',
        'materia_id',
        'gestion_academica_id'
    ];

    // Relaciones
    public function profesor()
    {
        return $this->belongsTo(User::class, 'profesor_id');
    }

    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    public function materia()
    {
        return $this->belongsTo(Materia::class);
    }

    public function gestionAcademica()
    {
        return $this->belongsTo(GestionAcademica::class);
    }
}
