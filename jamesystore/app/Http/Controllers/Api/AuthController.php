<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'phone' => ['required'],
            'password' => ['required'],
        ]);

        // Try admin (User model) authentication first via Sanctum
        $adminUser = User::where('phone', $request->phone)->first();
        if ($adminUser && Hash::check($request->password, $adminUser->password)) {
            $token = $adminUser->createToken('auth_token')->plainTextToken;

            return response()->json([
                'token' => $token,
                'user' => $adminUser,
                'role' => 'admin',
                'must_change_password' => false,
            ]);
        }

        // Try staff (Staff model) authentication
        $staff = Staff::where('phone', $request->phone)->first();
        if ($staff && Hash::check($request->password, $staff->password)) {
            // Check if staff is active
            if (!$staff->is_active) {
                return response()->json(['message' => 'Account is deactivated. Contact admin.'], 403);
            }

            $token = $staff->createToken('auth_token')->plainTextToken;

            $mustChange = (bool) ($staff->must_change_password ?? false);

            return response()->json([
                'token' => $token,
                'user' => $staff,
                'role' => 'staff',
                'must_change_password' => $mustChange,
            ]);
        }

        return response()->json(['message' => 'Invalid phone number or password'], 401);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $role = $user instanceof Staff ? 'staff' : 'admin';

        return response()->json([
            'user' => $user,
            'role' => $role,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        $user->password = Hash::make($request->new_password);

        // If staff, clear must_change_password flag
        if ($user instanceof Staff) {
            $user->must_change_password = false;
        }

        $user->save();

        return response()->json(['message' => 'Password changed successfully']);
    }
}

