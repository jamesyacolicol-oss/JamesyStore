<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class Authenticate extends Middleware
{
    public function handle($request, Closure $next, ...$guards)
    {
        $sessionGuard = $request->session()->get('auth_guard');

        if ($sessionGuard) {
            Auth::shouldUse($sessionGuard);
        }

        if (! Auth::guard($sessionGuard)->check()) {
            return redirect()->route('login');
        }

        return $next($request);
    }

    protected function redirectTo(Request $request): ?string
    {
        return $request->expectsJson() ? null : route('login');
    }
}
