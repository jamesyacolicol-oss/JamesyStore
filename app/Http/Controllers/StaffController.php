<?php

namespace App\Http\Controllers;

use App\Http\Requests\StaffRequest;
use App\Models\Staff;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\View\View;

class StaffController extends Controller
{
    public function __construct()
    {
        $this->middleware('admin');
    }

    public function index(Request $request): View
    {
        $search = trim((string) $request->string('search'));

        $staffMembers = Staff::query()
            ->withCount('orders')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('name', 'like', '%' . $search . '%')
                        ->orWhere('email', 'like', '%' . $search . '%')
                        ->orWhere('phone', 'like', '%' . $search . '%');
                });
            })
            ->latest()
            ->get();

        return view('auth.admin.staff', compact('staffMembers', 'search'));
    }

    public function create(): View
    {
        return view('staff.form', [
            'staffMember' => new Staff(),
        ]);
    }

    public function store(StaffRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $generatedPassword = null;

        if (empty($data['password'])) {
            $generatedPassword = $this->generateTemporaryPassword();
            $data['password'] = Hash::make($generatedPassword);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $data['role'] = 'staff';
        $data['must_change_password'] = true;

        Staff::create($data);

        $message = 'Seller account created successfully. Give this temporary password to the seller: ' . ($generatedPassword ?: '[the password you entered]');

        return redirect()
            ->route('staff.index')
            ->with('success', $message);
    }

    public function edit(Staff $staff): View
    {
        return view('staff.form', [
            'staffMember' => $staff,
        ]);
    }

    public function show(Staff $staff): View
    {
        $staff->load([
            'orders' => fn ($query) => $query
                ->with(['customer', 'details'])
                ->latest('ordered_at'),
        ]);

        $stats = [
            'orders_count' => $staff->orders->count(),
            'customers_count' => $staff->orders->whereNotNull('customer_id')->pluck('customer_id')->unique()->count(),
            'total_sales' => $staff->orders->sum('total_amount'),
            'average_order' => $staff->orders->count() > 0
                ? $staff->orders->avg('total_amount')
                : 0,
        ];

        return view('staff.show', [
            'staffMember' => $staff,
            'stats' => $stats,
            'orders' => $staff->orders,
        ]);
    }

    public function update(StaffRequest $request, Staff $staff): RedirectResponse
    {
        $data = $request->validated();
        $data['role'] = 'staff';
        $message = 'Seller account updated successfully.';

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
            $data['must_change_password'] = true;
            $data['force_logout_at'] = now();
        }

        $staff->update($data);

        return redirect()
            ->route('staff.index')
            ->with('success', 'Password updated. Seller will be logged out and must login with the new password.');
    }

    public function destroy(Staff $staff): RedirectResponse
    {
        if ((int) auth()->id() === (int) $staff->id) {
            return back()->with('error', 'You cannot delete the account you are currently using.');
        }

        $staff->delete();

        return redirect()
            ->route('staff.index')
            ->with('success', 'Staff account deleted successfully.');
    }

    protected function generateTemporaryPassword(): string
    {
        return strtoupper(Str::random(4)) . random_int(1000, 9999);
    }
}
