<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class PasswordController extends Controller
{
    public function edit(): View
    {
        return view('auth.change-password');
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();
        $guard = $request->session()->get('auth_guard', config('auth.defaults.guard'));

        Auth::guard($guard)->user()->update([
            'password' => Hash::make($request->password),
            'must_change_password' => false,
            'force_logout_at' => null,
        ]);

        return redirect()
            ->route('dashboard')
            ->with('success', 'Password changed successfully.');
    }
}
