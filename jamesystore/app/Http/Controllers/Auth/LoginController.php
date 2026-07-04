<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\StaffLoginRequest;
use App\Models\Staff;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class LoginController extends Controller
{
    public function create(): View
    {
        return view('login');
    }

    public function store(StaffLoginRequest $request): RedirectResponse
    {
        $credentials = $request->validated();
        $login = trim((string) $credentials['login']);
        $remember = $request->boolean('remember');
        $password = $credentials['password'];

        // Admin access is restricted to the single owner account.
        if (strtolower($login) === 'jamesy') {
            $adminPhone = '09289230563';

            if (! Auth::guard('web')->attempt([
                'phone' => $adminPhone,
                'password' => $password,
            ], $remember)) {
                return back()
                    ->withErrors(['login' => 'Invalid admin username or password.'])
                    ->onlyInput('login');
            }

            $this->setLoggedGuard('web');
            return $this->afterLogin($request);
        }

        // Staff login uses a phone number identifier.
        if (! preg_match('/^09[0-9]{9}$/', $login)) {
            return back()
                ->withErrors(['login' => 'Username is reserved for admin only. Use your staff phone number to login.'])
                ->onlyInput('login');
        }

        $staff = Staff::query()
            ->where('phone', $login)
            ->where('is_active', true)
            ->first();

        if (! $staff) {
            return back()
                ->withErrors(['login' => 'Account not found. Please register or ask an admin to create your record.'])
                ->onlyInput('login');
        }

        \Log::info('Staff login attempt', [
            'phone' => $login,
            'staff_id' => $staff->id,
            'staff_name' => $staff->name,
        ]);

        if (! Auth::guard('staff')->attempt([
            'phone' => $login,
            'password' => $password,
        ], $remember)) {
            \Log::error('Staff auth failed', ['staff_id' => $staff->id]);

            return back()
                ->withErrors(['password' => 'Incorrect password for the provided staff phone number.'])
                ->onlyInput('login');
        }

        $staff->update(['force_logout_at' => null]);

        $this->setLoggedGuard('staff');
        return $this->afterLogin($request);
    }

    public function destroy(Request $request): RedirectResponse
    {
        $guard = $request->session()->pull('auth_guard', config('auth.defaults.guard'));
        Auth::guard($guard)->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        Auth::shouldUse(config('auth.defaults.guard'));

        return redirect()->route('login');
    }

    protected function setLoggedGuard(string $guard): void
    {
        Auth::shouldUse($guard);
        session(['auth_guard' => $guard]);
    }

    protected function afterLogin(Request $request): RedirectResponse
    {
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }
}
