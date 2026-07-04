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
        // When hitting API routes, the request may not have a session configured.
        // For JSON requests, return 401 instead of crashing.
        if ($request->expectsJson()) {
            return $next($request);
        }

        // Avoid calling session() on requests that do not have a session store.
        // For API/JSON requests, we already returned earlier via expectsJson().
        $sessionGuard = $request->hasSession() ? $request->session()->get('auth_guard') : null;

        if ($sessionGuard) {
            Auth::shouldUse($sessionGuard);
        }

        // If we have no session guard, treat request as unauthenticated (API will return 401 earlier).
        if (! $sessionGuard) {
            return $request->expectsJson() ? response()->json(['message' => 'Unauthenticated.'], 401) : redirect()->route('login');
        }

        if (! Auth::guard($sessionGuard)->check()) {
            return $request->expectsJson() ? response()->json(['message' => 'Unauthenticated.'], 401) : redirect()->route('login');
        }


        return $next($request);
    }


    protected function redirectTo(Request $request): ?string
    {
        return $request->expectsJson() ? null : route('login');
    }
}
