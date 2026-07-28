<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function index(Request $request): View
    {
        $user = auth()->user();
        $search = trim((string) $request->string('search'));
        $dateFilter = $request->string('date')->toString();

        // Determine if admin or staff
        $isAdmin = $user instanceof \App\Models\User;

        // Get all orders for stats
        $allOrdersQuery = Order::query();
        if (! $isAdmin) {
            $allOrdersQuery->where('staff_id', $user->id);
        }
        $allOrders = $allOrdersQuery->get();

        // Filtered orders
        $ordersQuery = Order::query();
        if (! $isAdmin) {
            $ordersQuery->where('staff_id', $user->id);
        }
        if ($dateFilter) {
            $ordersQuery->whereDate('ordered_at', $dateFilter);
        }
        $orders = $ordersQuery->get();

        $totalOrders = $allOrders->count();
        $filteredOrders = $orders->count();
        $completedOrders = $allOrders->where('status', 'completed')->count();
        $paidOrders = $allOrders->where('payment_status', 'paid')->count();
        $partialOrders = $allOrders->where('payment_status', 'partial')->count();
        $unpaidOrders = $allOrders->where('payment_status', 'unpaid')->count();
        $guestOrders = $allOrders->whereNull('customer_id')->count();

        $totalRevenue = $allOrders->sum('total_amount');
        $totalPaid = $allOrders->sum('paid_amount');
        $totalUnpaid = $totalRevenue - $totalPaid;
        $filteredRevenue = $orders->sum('total_amount');
        $filteredPaid = $orders->sum('paid_amount');

        $stats = [
            'staff' => Staff::count(),
            'customers' => Customer::count(),
            'products' => Product::count(),
            'orders' => $totalOrders,
            'revenue' => $totalRevenue,
            'paid' => $totalPaid,
            'unpaid' => $totalUnpaid,
            'average_order' => $totalOrders > 0 ? $allOrders->avg('total_amount') : 0,
            'filtered_orders' => $filteredOrders,
            'filtered_revenue' => $filteredRevenue,
            'filtered_paid' => $filteredPaid,
        ];

        // Recent orders
        $recentOrdersQuery = Order::query()->with(['customer', 'staff', 'user']);
        if (! $isAdmin) {
            $recentOrdersQuery->where('staff_id', $user->id);
        }
        $recentOrders = $recentOrdersQuery->latest('ordered_at')->take(8)->get();

        // Sales trend (last 7 days)
        $salesTrend = collect(range(6, 0))->map(function (int $offset) use ($allOrders) {
            $day = Carbon::today()->subDays($offset);
            $dailyOrders = $allOrders->filter(fn (Order $order) => $order->ordered_at?->isSameDay($day) ?? false);

            return [
                'label' => $day->format('M d'),
                'orders' => $dailyOrders->count(),
                'revenue' => (float) $dailyOrders->sum('total_amount'),
                'paid' => (float) $dailyOrders->sum('paid_amount'),
            ];
        });
        $maxTrendRevenue = max(1, (float) $salesTrend->max('revenue'));

        // Payment breakdown
        $paymentBreakdown = [
            'paid' => ['count' => $paidOrders, 'amount' => $allOrders->where('payment_status', 'paid')->sum('total_amount')],
            'partial' => ['count' => $partialOrders, 'amount' => $allOrders->where('payment_status', 'partial')->sum('total_amount')],
            'unpaid' => ['count' => $unpaidOrders, 'amount' => $allOrders->where('payment_status', 'unpaid')->sum('total_amount')],
        ];

        // Staff performance (admin only)
        $staffPerformance = [];
        if ($isAdmin) {
            $staffPerformance = Staff::query()
                ->withCount(['orders' => function ($query) {
                    $query->whereDate('ordered_at', today());
                }])
                ->withSum(['orders' => function ($query) {
                    $query->whereDate('ordered_at', today());
                }], 'total_amount')
                ->orderByDesc('orders_sum_total_amount')
                ->take(5)
                ->get()
                ->map(fn ($s) => [
                    'name' => $s->name,
                    'orders' => $s->orders_count,
                    'sales' => (float) $s->orders_sum_total_amount,
                ]);
        }

        // Monthly stats
        $thisMonth = Order::query();
        if (! $isAdmin) $thisMonth->where('staff_id', $user->id);
        $thisMonth->whereMonth('ordered_at', now()->month)->whereYear('ordered_at', now()->year);
        $monthlyStats = [
            'orders' => $thisMonth->count(),
            'revenue' => $thisMonth->sum('total_amount'),
            'paid' => $thisMonth->sum('paid_amount'),
        ];

        $searchResults = [
            'staff' => collect(),
            'customers' => collect(),
            'products' => collect(),
        ];

        if ($search !== '') {
            $searchResults['staff'] = Staff::query()
                ->withCount('orders')
                ->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%')
                        ->orWhere('phone', 'like', '%' . $search . '%');
                })
                ->orderBy('name')
                ->take(6)
                ->get();

            $searchResults['customers'] = Customer::query()
                ->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', '%' . $search . '%')
                        ->orWhere('phone', 'like', '%' . $search . '%')
                        ->orWhere('address', 'like', '%' . $search . '%');
                })
                ->orderBy('name')
                ->take(6)
                ->get();

            $searchResults['products'] = Product::query()
                ->where(function ($query) use ($search) {
                    $query
                        ->where('sku', 'like', '%' . $search . '%')
                        ->orWhere('name', 'like', '%' . $search . '%')
                        ->orWhere('description', 'like', '%' . $search . '%');
                })
                ->orderBy('name')
                ->take(6)
                ->get();
        }

        if ($isAdmin) {
            return view('auth.admin.dashboard', compact(
                'stats', 'recentOrders', 'salesTrend', 'maxTrendRevenue',
                'search', 'searchResults', 'paymentBreakdown', 'staffPerformance', 'monthlyStats', 'dateFilter'
            ));
        }

        return view('auth.staff.dashboard', compact(
            'stats', 'recentOrders', 'salesTrend', 'maxTrendRevenue',
            'search', 'searchResults', 'paymentBreakdown', 'monthlyStats', 'dateFilter'
        ));
    }

    protected function percentage(int $value, int $total): int
    {
        if ($total === 0) {
            return 0;
        }

        return (int) round(($value / $total) * 100);
    }
}
