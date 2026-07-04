<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ForceStaffLogout
{
    public function handle(Request $request, Closure $next): Response
    {
        $guard = $request->session()->get('auth_guard', config('auth.defaults.guard'));
        $user = Auth::guard($guard)->user();

        if ($user && $user instanceof \App\Models\Staff && $user->force_logout_at) {
            Auth::guard($guard)->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('success', 'You have been logged out. Please login again.');
        }

        return $next($request);
    }
}
