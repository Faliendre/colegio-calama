<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UppercaseStrings
{
    /**
     * The names of the attributes that should not be converted to uppercase.
     *
     * @var array<int, string>
     */
    protected $except = [
        'password',
        'password_confirmation',
        'current_password',
        'email',
        'username',
        'role',
        'estado',
        'genero',
        'token',
        '_token',
        'method',
        '_method',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->all();

        array_walk_recursive($input, function (&$value, $key) {
            if (is_string($value) && !in_array($key, $this->except, true)) {
                $value = mb_strtoupper($value, 'UTF-8');
            }
        });

        $request->merge($input);

        return $next($request);
    }
}
