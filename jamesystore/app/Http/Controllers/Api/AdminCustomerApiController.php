<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class AdminCustomerApiController extends Controller
{
    /**
     * GET /api/admin/customers
     */
    public function index(Request $request)
    {
        $customers = Customer::query()
            ->orderBy('customer_id', 'desc')
            ->get(['customer_id', 'customer_name', 'number', 'address']);

        // UI-friendly shape for React table
        $data = $customers->map(function (Customer $c) {
            return [
                'customer_id'   => $c->customer_id,
                'customer_name' => $c->customer_name,
                'number'        => $c->number ?? '-',
                'location'      => $c->address ?? '-',
            ];
        });

        return response()->json($data);
    }

    /**
     * POST /api/admin/customers
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:100',
            'number'        => 'nullable|string|max:20',
            'address'       => 'nullable|string|max:200',
        ]);

        $customer = Customer::create($validated);

        return response()->json([
            'success' => true,
            'customer' => [
                'customer_id'   => $customer->customer_id,
                'customer_name' => $customer->customer_name,
                'number'        => $customer->number,
                'location'      => $customer->address,
            ],
        ], 201);
    }
}

