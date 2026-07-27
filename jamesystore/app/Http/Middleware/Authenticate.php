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
        // For API/JSON requests with Sanctum — delegate to parent authenticate()
        // which will validate the Bearer token and throw AuthenticationException if invalid.
        if ($request->expectsJson()) {
            // If guards are empty, default to 'sanctum' for API routes
            if (empty($guards)) {
                $guards = ['sanctum'];
            }
            $this->authenticate($request, $guards);
            return $next($request);
        }

        // Web request handling with session guard
        $sessionGuard = $request->hasSession() ? $request->session()->get('auth_guard') : null;

        if ($sessionGuard) {
            Auth::shouldUse($sessionGuard);
        }

        if (! $sessionGuard) {
            return redirect()->route('login');
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
