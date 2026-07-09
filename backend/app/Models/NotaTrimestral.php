<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotaTrimestral extends Model
{
    use HasFactory;

    protected $table = 'notas_trimestrales';

    protected $fillable = [
        'matricula_id',
        'asignacion_profesor_id',
        'trimestre_id',
        'nota_final',
        'aprobado',
    ];

    protected $casts = [
        'nota_final' => 'decimal:2',
        'aprobado' => 'boolean',
    ];

    // Relaciones
    public function matricula()
    {
        return $this->belongsTo(Matricula::class);
    }

    public function asignacionProfesor()
    {
        return $this->belongsTo(AsignacionProfesor::class);
    }

    public function trimestre()
    {
        return $this->belongsTo(Trimestre::class);
    }
}
