<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
   public function login(Request $request)
{
    // Validate that the request contains phone and password
    $credentials = $request->validate([
        'phone' => ['required'], 
        'password' => ['required'],
    ]);

    // Attempt authentication using the 'phone' column
    if (Auth::attempt($credentials)) {
        $user = $request->user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    return response()->json(['message' => 'Invalid phone number or password'], 401);
}
}