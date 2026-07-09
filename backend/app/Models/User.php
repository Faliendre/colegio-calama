<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'username',
        'password',
        'nombre',
        'apellido_paterno',
        'apellido_materno',
        'role',
        'activo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    // Relaciones
    public function cursosComoAsesor()
    {
        return $this->hasMany(Curso::class, 'asesor_id');
    }

    public function asignacionesComoProfesor()
    {
        return $this->hasMany(AsignacionProfesor::class, 'profesor_id');
    }

    // Scopes
    public function scopeAdministradores($query)
    {
        return $query->where('role', 'administrador');
    }

    public function scopeProfesores($query)
    {
        return $query->where('role', 'profesor');
    }

    public function scopeAsesores($query)
    {
        return $query->where('role', 'asesor');
    }

    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}
