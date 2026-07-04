<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AdminDashboardApiController extends Controller
{
    public function index(Request $request)
    {
        // 1. Check authentication
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $today = Carbon::today();

        // 2. Fetch data efficiently
        // Using an array to group data makes it easier for the frontend to digest
        return response()->json([
            'status' => 'success',
            'stats' => [
                'products_count' => Product::count(),
                'orders_count'   => Order::count(),
                'staff_count'    => Staff::where('is_active', true)->count(),
                'total_revenue'  => (float) Order::sum('total_amount'),
                'today' => [
                    'revenue' => (float) Order::whereDate('ordered_at', $today)->sum('paid_amount'),
                    'orders'  => (int) Order::whereDate('ordered_at', $today)->count(),
                ]
            ]
        ]);
    }
}