<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Materia extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'codigo'
    ];

    // Relaciones
    public function asignaciones()
    {
        return $this->hasMany(AsignacionProfesor::class);
    }
}
