<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StaffApiController extends Controller
{
    // GET /api/staff/products
    public function products()
    {
        $products = Product::with('category')->orderBy('product_name')->get();
        return response()->json($products);
    }

    // GET /api/staff/customers
    public function customers()
    {
        $customers = Customer::orderBy('customer_name')->get();
        return response()->json($customers);
    }

// GET /api/staff/orders
    public function orders()
    {
        $orders = Order::query()
            ->with(['orderDetails.product', 'customer'])
            ->orderBy('order_id', 'desc')
            ->get();

        return $orders->map(function (Order $o) {
            $items = $o->orderDetails ?? collect();

            // Determine customer name: from relation, from notes field, or fallback
            $customerName = null;
            if ($o->customer) {
                $customerName = $o->customer->customer_name;
            } elseif ($o->notes && preg_match('/^Customer:\s*(.+)$/i', $o->notes, $m)) {
                $customerName = trim($m[1]);
            }

            return [
                'order_id' => $o->order_id,
                'order_number' => $o->order_number,
                'ordered_at' => $o->ordered_at,
                'customer_name' => $customerName,
                'items' => $items->values()->map(function ($item) {
                    return [
                        'product_id' => $item->product_id,
                        'product_code' => $item->product?->product_code ?? '-',
                        'product_name' => $item->product?->product_name ?? 'Unknown Product',
                        'quantity' => $item->quantity,
                        'ordered_price' => $item->ordered_price,
                        'line_total' => (float) $item->quantity * (float) $item->ordered_price,
                    ];
                }),
                'total_amount' => $o->total_amount,
                'paid_amount' => $o->paid_amount,
                'payment_amount' => $o->payment_amount,
                'change_amount' => $o->change_amount,
                'payment_status' => $o->payment_status,
                'payment_method' => $o->payment_method,
                'notes' => $o->notes,
            ];
        });
    }

    // GET /api/staff/orders/next-number
    public function nextOrderNumber()
    {
        $last = Order::query()->orderBy('order_id', 'desc')->first();

        if (!$last || empty($last->order_number)) {
            return response()->json(['next_order_number' => '100']);
        }

        $digits = preg_replace('/[^0-9]/', '', (string) $last->order_number);
        $next = $digits !== '' ? (int) $digits + 1 : 100;

        return response()->json(['next_order_number' => (string) $next]);
    }

    // POST /api/staff/orders
    public function storeOrder(Request $request)
    {
        if (! $request->has('items') || ! is_array($request->items) || count($request->items) === 0) {
            return response()->json(['message' => 'Invalid payload: items is required and must be a non-empty array.'], 422);
        }

        foreach ($request->items as $i => $item) {
            if (! isset($item['product_id'], $item['quantity'], $item['price']) || (int) $item['quantity'] <= 0) {
                return response()->json([
                    'message' => 'Invalid payload: each item must include product_id, quantity (>0), and price.',
                    'item_index' => $i,
                ], 422);
            }
        }

        if ($request->filled('customer_id')) {
            $exists = Customer::where('customer_id', $request->customer_id)->exists();
            if (! $exists) {
                return response()->json(['message' => 'Customer not found with the provided customer_id.'], 422);
            }
        }

        try {
            $order = DB::transaction(function () use ($request) {
                $order = Order::create([
                    'customer_id'    => $request->customer_id ?? null,
                    'user_id'        => $request->user()?->id ?? 1,
                    'order_number'   => $request->order_number ?? ('ORD-' . time()),
                    'subtotal'       => $request->subtotal ?? $request->total_amount,
                    'tax_amount'     => $request->tax_amount ?? 0,
                    'total_amount'   => $request->total_amount,
                    'payment_amount' => $request->payment_amount,
                    'paid_amount'    => $request->paid_amount ?? ($request->payment_amount ?? 0),
                    'change_amount'  => $request->change_amount,
                    'payment_method' => $request->payment_method ?? 'cash',
                    'status'         => $request->status ?? 'paid',
                    'payment_status' => $request->payment_status ?? 'paid',
                    'notes'          => $request->notes ?? null,
                    'ordered_at'     => $request->ordered_at ?? now(),
                ]);

                foreach ($request->items as $item) {
                    OrderDetail::create([
                        'order_id'      => $order->order_id,
                        'product_id'    => $item['product_id'],
                        'quantity'      => (int) $item['quantity'],
                        'ordered_price' => (float) $item['price'],
                    ]);
                }

                return $order;
            });

            return response()->json(['success' => true, 'order_id' => $order->order_id], 201);
        } catch (\Exception $e) {
            \Log::error('StaffOrderStore Error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    // GET /api/staff/dashboard
    public function dashboard()
    {
        $totalOrders = Order::count();
        $recentOrders = Order::with(['orderDetails.product', 'customer'])
            ->orderBy('order_id', 'desc')
            ->take(5)
            ->get();

        $products = Product::with('category')->orderBy('product_name')->get();

        $lowStock = $products->filter(function ($p) {
            return ($p->stock_quantity ?? 0) <= 5;
        })->values();

        return response()->json([
            'total_orders' => $totalOrders,
            'recent_orders' => $recentOrders->map(function ($o) {
                $customerName = null;
                if ($o->customer) {
                    $customerName = $o->customer->customer_name;
                } elseif ($o->notes && preg_match('/^Customer:\s*(.+)$/i', $o->notes, $m)) {
                    $customerName = trim($m[1]);
                }
                return [
                    'order_id' => $o->order_id,
                    'order_number' => $o->order_number,
                    'ordered_at' => $o->ordered_at,
                    'customer_name' => $customerName,
                    'total_amount' => $o->total_amount,
                    'payment_status' => $o->payment_status,
                    'items_count' => $o->orderDetails?->count() ?? 0,
                ];
            }),
            'products' => $products->map(function ($p) {
                return [
                    'product_id' => $p->product_id,
                    'product_name' => $p->product_name,
                    'stock_quantity' => $p->stock_quantity,
                    'price' => $p->price,
                ];
            }),
            'low_stock' => $lowStock->map(function ($p) {
                return [
                    'product_id' => $p->product_id,
                    'product_name' => $p->product_name,
                    'stock_quantity' => $p->stock_quantity,
                ];
            }),
        ]);
    }
}

