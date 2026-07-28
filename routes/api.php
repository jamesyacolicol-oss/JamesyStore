<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StaffController;
use Illuminate\Support\Facades\Route;

Route::prefix('')->group(function () {
    // Public login endpoint used by React: POST /api/login
    Route::post('/login', [AuthController::class, 'login'])->name('login');

    // Protected endpoints (depends on your auth implementation)
    // If your project uses Sanctum/JWT differently, adjust middleware accordingly.
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/me', [AuthController::class, 'me'])->name('me');
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::put('/change-password', [AuthController::class, 'changePassword'])->name('change-password');

        // If your React redirects to /dashboard (web), you still may need a web route.
        // This API endpoint is for fetching dashboard data.
