<?php

use App\Http\Controllers\Api\{
    AdminDashboardApiController,
    AdminProductApiController,
    AdminStaffApiController,
    AdminOrderApiController,
    AuthController
};
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth Management
    Route::controller(AuthController::class)->group(function () {
        Route::get('/me', 'me');
        Route::post('/logout', 'logout');
        Route::put('/change-password', 'changePassword');
    });

    // Admin API Routes
    Route::prefix('admin')->group(function () {
        
        Route::get('/dashboard', [AdminDashboardApiController::class, 'index']);

        // Products
        // apiResource automatically handles: index, store, update, destroy, show
        Route::get('/products/next-code', [AdminProductApiController::class, 'nextCode']);
        Route::apiResource('products', AdminProductApiController::class);

        // Orders
        Route::prefix('orders')->group(function () {
            Route::get('/', [AdminOrderApiController::class, 'index']);
            Route::post('/', [AdminOrderApiController::class, 'store']);
            Route::delete('/{id}', [AdminOrderApiController::class, 'destroy']);
            Route::get('/next-number', [AdminOrderApiController::class, 'getNextOrderNumber']);
        });

        // Staff
        Route::apiResource('staff', AdminStaffApiController::class);
    });
});