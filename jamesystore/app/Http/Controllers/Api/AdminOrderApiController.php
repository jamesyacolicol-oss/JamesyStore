<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;

class AdminOrderApiController extends Controller
{
    // POST /api/admin/orders
    public function store(Request $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                // Save order header (respect request payload when present)
                $order = Order::create([
                    'customer_id'    => $request->customer_id ?? null,
                    'user_id'        => 1, // TODO: replace with $request->user()->id / owner key when ready
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

                if (! $request->has('items') || ! is_array($request->items) || count($request->items) === 0) {
                    return response()->json(['message' => 'Invalid payload: items is required and must be a non-empty array.'], 422);
                }

                foreach ($request->items as $item) {
                    if (
                        ! isset($item['product_id'], $item['quantity'], $item['price']) ||
                        (int) $item['quantity'] <= 0
                    ) {
                        return response()->json(['message' => 'Invalid payload: each item must include product_id, quantity (>0), and price.'], 422);
                    }

                    OrderDetail::create([
                        'order_id'      => $order->order_id,
                        'product_id'    => $item['product_id'],
                        'quantity'      => (int) $item['quantity'],
                        'ordered_price' => (float) $item['price'],
                    ]);
                }

                return response()->json(['success' => true], 201);
            });
        } catch (\Exception $e) {
            // I-log ang error para makita mo sa storage/logs/laravel.log
            \Log::error('DEBUG ERROR: ' . $e->getMessage());
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // DELETE /api/admin/orders/{id}
    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $items = OrderDetail::where('order_id', $id)->get();
            
            // Ibalik ang stock
            foreach ($items as $item) {
                Product::where('product_id', $item->product_id)
                    ->increment('stock_quantity', $item->quantity);
            }

            OrderDetail::where('order_id', $id)->delete();
            Order::where('order_id', $id)->delete();

            return response()->json(['success' => true]);
        });
    }
}