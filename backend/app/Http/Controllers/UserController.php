<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Listar todos los usuarios
     */
    public function index()
    {
        $users = User::select('id', 'username', 'nombre as name', 'apellido_paterno', 'apellido_materno', 'role', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    /**
     * Crear un nuevo usuario
     */
    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'name' => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',  // ← Nuevo
            'apellido_materno' => 'required|string|max:255',  // ← Nuevo
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['administrador', 'profesor', 'asesor'])],
        ]);

        $user = User::create([
            'username' => $request->username,
            'nombre' => $request->name,
            'apellido_paterno' => $request->apellido_paterno,  // ← Nuevo
            'apellido_materno' => $request->apellido_materno,  // ← Nuevo
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return response()->json([
            'message' => 'Usuario creado exitosamente',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->nombre,
                'apellido_paterno' => $user->apellido_paterno,
                'apellido_materno' => $user->apellido_materno,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ]
        ], 201);
    }


    /**
     * Mostrar un usuario específico
     */
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'name' => $user->nombre,
            'role' => $user->role,
            'created_at' => $user->created_at,
        ]);
    }

    /**
     * Actualizar un usuario
     */
   public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'username' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'name' => 'required|string|max:255',
            'apellido_paterno' => 'required|string|max:255',  // ← Nuevo
            'apellido_materno' => 'required|string|max:255',  // ← Nuevo
            'role' => ['required', Rule::in(['administrador', 'profesor', 'asesor', 'student'])],
            'password' => 'nullable|string|min:8',
        ]);

        $user->username = $request->username;
        $user->nombre = $request->name;
        $user->apellido_paterno = $request->apellido_paterno;  // ← Nuevo
        $user->apellido_materno = $request->apellido_materno;  // ← Nuevo
        $user->role = $request->role;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'Usuario actualizado exitosamente',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->nombre,
                'apellido_paterno' => $user->apellido_paterno,
                'apellido_materno' => $user->apellido_materno,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    /**
     * Eliminar un usuario
     */
    public function destroy($id)
    {
        // 1. Evitar autodeleción
        if ($id == auth()->id()) {
            return response()->json([
                'message' => 'No puedes eliminar tu propia cuenta de usuario en sesión.'
            ], 400);
        }

        $user = User::findOrFail($id);

        // 2. Proteger al único administrador del sistema
        if ($user->role === 'administrador') {
            $adminCount = User::where('role', 'administrador')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'message' => 'No se puede eliminar al único administrador del sistema. Debe existir al menos uno activo.'
                ], 400);
            }
        }

        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado exitosamente'
        ]);
    }
}
