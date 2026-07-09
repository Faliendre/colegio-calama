<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Administrador
        User::create([
            'username' => 'admin',
            'password' => Hash::make('admin123'),
            'nombre' => 'Delfín',
            'apellido_paterno' => 'Colque',
            'apellido_materno' => 'García',
            'role' => 'administrador',
            'activo' => true,
        ]);

        // Secretario (también administrador)
        User::create([
            'username' => 'ramiro',
            'password' => Hash::make('ramiro123'),
            'nombre' => 'Ramiro',
            'apellido_paterno' => 'López',
            'apellido_materno' => 'Pérez',
            'role' => 'administrador',
            'activo' => true,
        ]);

        // Profesor
        User::create([
            'username' => 'edwin.villca',
            'password' => Hash::make('profesor123'),
            'nombre' => 'Edwin',
            'apellido_paterno' => 'Villca',
            'apellido_materno' => 'Mamani',
            'role' => 'profesor',
            'activo' => true,
        ]);

        // Asesora
        User::create([
            'username' => 'sonia.vargas',
            'password' => Hash::make('asesor123'),
            'nombre' => 'Sonia',
            'apellido_paterno' => 'Vargas',
            'apellido_materno' => 'Quispe',
            'role' => 'asesor',
            'activo' => true,
        ]);
    }
}
