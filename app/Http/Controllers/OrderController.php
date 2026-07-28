<?php

namespace App\Http\Controllers;

use App\Http\Requests\OrderRequest;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class OrderController extends Controller
{
    public function index(Request $request): View
    {
        $search = trim((string) $request->string('search'));
        $dateFilter = $request->string('date')->toString() ?: today()->format('Y-m-d');
        $user = auth()->user();
        $isAdmin = $user instanceof \App\Models\User;

        $ordersQuery = Order::query()
            ->with(['customer', 'staff', 'user', 'details']);

        if (! $isAdmin) {
            // Staff only sees their own orders
            $ordersQuery->where('staff_id', $user->id);
        }

        // Date filter
        if ($dateFilter) {
            $ordersQuery->whereDate('ordered_at', $dateFilter);
        }

        $ordersQuery->when($search !== '', function ($query) use ($search) {
            $query->where('order_number', 'like', '%' . $search . '%')
                ->orWhereHas('customer', fn ($builder) => $builder->where('name', 'like', '%' . $search . '%'))
                ->orWhereHas('staff', fn ($builder) => $builder->where('name', 'like', '%' . $search . '%'))
                ->orWhereHas('user', fn ($builder) => $builder->where('name', 'like', '%' . $search . '%'));
        });

        $orders = $ordersQuery->latest('ordered_at')->get();

        // Today's total and paid
        $todayQuery = Order::query();
        if (! $isAdmin) {
            $todayQuery->where('staff_id', $user->id);
        }
        $todayQuery->whereDate('ordered_at', today());
        $todayTotal = $todayQuery->sum('total_amount');
        $todayQueryPaid = $todayQuery->sum('paid_amount');

        $view = $isAdmin ? 'auth.admin.order' : 'auth.staff.order';

        return view($view, compact('orders', 'search', 'dateFilter', 'todayTotal', 'todayQueryPaid'));
    }

    public function show(Order $order): View
    {
        $order->load(['customer', 'staff', 'user', 'details.product']);

        return view('orders.show', compact('order'));
    }

    public function print(Order $order): View
    {
        $order->load(['customer', 'staff', 'user', 'details.product']);

        return view('orders.receipt', compact('order'));
    }

    public function create(): View
    {
        return view('orders.form', [
            'order' => new Order(),
            'customers' => Customer::where('is_active', true)->orderBy('name')->get(),
            'products' => Product::where('is_active', true)->orderBy('name')->get(),
            'orderItems' => old('items', [['product_id' => '', 'quantity' => 1, 'price' => '']]),
        ]);
    }

    public function store(OrderRequest $request, OrderService $orderService): RedirectResponse
    {
        $data = $request->validated();
        $items = $data['items'] ?? [];
        $total = collect($items)->sum(fn ($item) => (float) $item['price'] * (int) $item['quantity']);
        $paid = (float) ($data['paid_amount'] ?? 0);

        if ($paid < $total) {
            return back()
                ->withInput()
                ->withErrors(['paid_amount' => 'Insufficient payment. Amount paid (' . number_format($paid, 2) . ') is less than the total (' . number_format($total, 2) . '). Please enter the full amount.']);
        }

        $orderService->create($data, $request->user());

        return redirect()
            ->route('orders.index')
            ->with('success', 'Order saved successfully.');
    }

    public function edit(Order $order): View
    {
        $user = auth()->user();
        $isAdmin = $user instanceof \App\Models\User;

        // Staff can only edit their own orders
        if (! $isAdmin && $order->staff_id !== $user->id) {
            abort(403, 'You can only edit your own orders.');
        }

        $order->load('details');

        return view('orders.form', [
            'order' => $order,
            'customers' => Customer::where('is_active', true)->orderBy('name')->get(),
            'products' => Product::where('is_active', true)->orderBy('name')->get(),
            'orderItems' => old('items', $order->details->map(function ($detail) {
                return [
                    'product_id' => $detail->product_id,
                    'quantity' => $detail->quantity,
                    'price' => $detail->price,
                ];
            })->all()),
        ]);
    }

    public function update(OrderRequest $request, Order $order, OrderService $orderService): RedirectResponse
    {
        $user = auth()->user();
        $isAdmin = $user instanceof \App\Models\User;

        // Staff can only edit their own orders
        if (! $isAdmin && $order->staff_id !== $user->id) {
            abort(403, 'You can only edit your own orders.');
        }

        $orderService->update($order, $request->validated());

        return redirect()
            ->route('orders.index')
            ->with('success', 'Order updated successfully.');
    }

    public function destroy(Order $order): RedirectResponse
    {
        $user = auth()->user();
        $isAdmin = $user instanceof \App\Models\User;

        // Staff can only delete their own orders
        if (! $isAdmin && $order->staff_id !== $user->id) {
            abort(403, 'You can only delete your own orders.');
        }

        // Restore stock before deleting order
        foreach ($order->details as $detail) {
            \App\Models\Product::where('id', $detail->product_id)
                ->increment('stock', $detail->quantity);
        }

        $order->delete();

        return redirect()
            ->route('orders.index')
            ->with('success', 'Order deleted and stock restored successfully.');
    }
}
