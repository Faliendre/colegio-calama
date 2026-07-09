<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CriterioEvaluacion extends Model
{
    use HasFactory;

    protected $table = 'criterios_evaluacion';

    protected $fillable = [
        'asignacion_profesor_id',
        'trimestre_id',
        'nombre',
        'ponderacion',
        'fecha_creacion',
    ];

    protected $casts = [
        'ponderacion' => 'decimal:2',
        'fecha_creacion' => 'date',
    ];

    // Relaciones
    public function asignacionProfesor()
    {
        return $this->belongsTo(AsignacionProfesor::class);
    }

    public function trimestre()
    {
        return $this->belongsTo(Trimestre::class);
    }

    public function notas()
    {
        return $this->hasMany(Nota::class);
    }
}
