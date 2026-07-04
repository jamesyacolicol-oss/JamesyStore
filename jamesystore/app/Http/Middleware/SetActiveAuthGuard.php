<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SetActiveAuthGuard
{
    public function handle(Request $request, Closure $next): Response
    {
        $guard = $request->session()->get('auth_guard', config('auth.defaults.guard'));
        Auth::shouldUse($guard);

        return $next($request);
    }
}
