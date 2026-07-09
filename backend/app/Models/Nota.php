<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Nota extends Model
{
    use HasFactory;

    protected $fillable = [
        'criterio_evaluacion_id',
        'alumno_id',
        'nota',
        'observaciones',
    ];

    protected $casts = [
        'nota' => 'decimal:2',
    ];

    // Relaciones
    public function criterioEvaluacion()
    {
        return $this->belongsTo(CriterioEvaluacion::class);
    }

    public function alumno()
    {
        return $this->belongsTo(Alumno::class);
    }
}
