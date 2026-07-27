<?php

use App\Http\Controllers\Api\{
    AdminDashboardApiController,
    AdminProductApiController,
    AdminStaffApiController,
    AdminOrderApiController,
    AuthController,
    AdminCustomerApiController,
    StaffApiController,
};
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (API)
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
        Route::get('/products/next-code', [AdminProductApiController::class, 'nextCode']);
        Route::apiResource('products', AdminProductApiController::class);

        // Customers
        Route::get('/customers', [AdminCustomerApiController::class, 'index']);
        Route::post('/customers', [AdminCustomerApiController::class, 'store']);

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

    // Staff API Routes (accessible by both staff and admin)
    Route::prefix('staff')->group(function () {
        Route::get('/products', [StaffApiController::class, 'products']);
        Route::get('/customers', [StaffApiController::class, 'customers']);
        Route::get('/orders', [StaffApiController::class, 'orders']);
        Route::get('/orders/next-number', [StaffApiController::class, 'nextOrderNumber']);
        Route::post('/orders', [StaffApiController::class, 'storeOrder']);
        Route::get('/dashboard', [StaffApiController::class, 'dashboard']);
    });
});

