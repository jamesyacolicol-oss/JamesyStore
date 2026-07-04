<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function create(array $data, Authenticatable $owner): Order
    {
        return DB::transaction(function () use ($data, $owner) {
            $items = $this->buildItems($data['items'] ?? []);
            $totals = $this->totals($items);
            $ownerColumns = $this->resolveOwnerColumns($owner);
            $paidAmount = (float) ($data['paid_amount'] ?? 0);
            $changeAmount = max($paidAmount - $totals['total'], 0);

            // Check stock availability before creating order
            foreach ($items as $item) {
                $product = Product::find($item['product_id']);
                if ($product && $product->stock < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => "Insufficient stock for '{$product->name}'. Available: {$product->stock}, Requested: {$item['quantity']}",
                    ]);
                }
            }

            if (! empty($ownerColumns['user_id']) && ! User::query()->whereKey($ownerColumns['user_id'])->exists()) {
                throw ValidationException::withMessages([
                    'user_id' => 'Unable to create order: current user does not exist in the database.',
                ]);
            }

            $order = Order::create([
                'order_number' => $this->nextOrderNumber(),
                'staff_id' => $ownerColumns['staff_id'],
                'user_id' => $ownerColumns['user_id'],
                'customer_id' => $this->resolveCustomerId($data),

                'status' => $data['status'] ?? Order::DEFAULT_STATUS,
                'payment_status' => $data['payment_status'] ?? Order::DEFAULT_PAYMENT_STATUS,
                'payment_method' => $data['payment_method'] ?? Order::PAYMENT_METHODS[0],
                'paid_amount' => $paidAmount,
                'change_amount' => $changeAmount,
                'subtotal' => $totals['subtotal'],
                'tax_amount' => 0,
                'total_amount' => $totals['total'],
                'ordered_at' => now(),
                'notes' => null,
            ]);

            $order->details()->createMany($items);

            // Deduct stock
            foreach ($items as $item) {
                Product::where('id', $item['product_id'])
                    ->decrement('stock', $item['quantity']);
            }

            return $order->load(['staff', 'user', 'customer', 'details.product']);
        });
    }

    public function update(Order $order, array $data): Order
    {
        return DB::transaction(function () use ($order, $data) {
            $items = $this->buildItems($data['items'] ?? []);
            $totals = $this->totals($items);
            $paidAmount = (float) ($data['paid_amount'] ?? 0);
            $changeAmount = max($paidAmount - $totals['total'], 0);

            // Check stock availability (excluding current order's quantities)
            $oldItems = $order->details->keyBy('product_id');
            foreach ($items as $item) {
                $product = Product::find($item['product_id']);
                if ($product) {
                    $oldQty = $oldItems->get($item['product_id'])?->quantity ?? 0;
                    $additionalNeeded = $item['quantity'] - $oldQty;
                    if ($additionalNeeded > 0 && $product->stock < $additionalNeeded) {
                        throw ValidationException::withMessages([
                            'items' => "Insufficient stock for '{$product->name}'. Available: {$product->stock}, Additional needed: {$additionalNeeded}",
                        ]);
                    }
                }
            }

            // Restore old stock
            foreach ($oldItems as $oldItem) {
                Product::where('id', $oldItem->product_id)
                    ->increment('stock', $oldItem->quantity);
            }

            $order->update([
                'customer_id' => $this->resolveCustomerId($data),
                'payment_status' => $data['payment_status'] ?? Order::DEFAULT_PAYMENT_STATUS,
                'payment_method' => $data['payment_method'] ?? Order::PAYMENT_METHODS[0],
                'paid_amount' => $paidAmount,
                'change_amount' => $changeAmount,
                'subtotal' => $totals['subtotal'],
                'tax_amount' => 0,
                'total_amount' => $totals['total'],
                'ordered_at' => $order->ordered_at ?? now(),
                'notes' => null,
            ]);

            $order->details()->delete();
            $order->details()->createMany($items);

            // Deduct new stock
            foreach ($items as $item) {
                Product::where('id', $item['product_id'])
                    ->decrement('stock', $item['quantity']);
            }

            return $order->load(['staff', 'user', 'customer', 'details.product']);
        });
    }

    protected function buildItems(array $payload): array
    {
        $productIds = collect($payload)->pluck('product_id')->filter()->unique()->values();
        $products = Product::query()->whereIn('id', $productIds)->get()->keyBy('id');

        return collect($payload)
            ->map(function (array $item) use ($products) {
                $product = $products->get($item['product_id']);

                if (! $product) {
                    throw ValidationException::withMessages([
                        'items' => ['One or more selected products could not be found.'],
                    ]);
                }

                $price = (float) ($item['price'] ?? $product->price);
                $quantity = max(1, (int) ($item['quantity'] ?? 1));

                return [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'price' => $price,
                    'line_total' => $price * $quantity,
                ];
            })
            ->values()
            ->all();
    }

    protected function totals(array $items): array
    {
        $subtotal = collect($items)->sum('line_total');

        return [
            'subtotal' => $subtotal,
            'total' => $subtotal,
        ];
    }

    protected function nextOrderNumber(): string
    {
        $base = 'ORD-' . now()->format('Ymd');
        $count = Order::query()
            ->whereDate('created_at', now()->toDateString())
            ->count() + 1;

        return $base . '-' . str_pad((string) $count, 4, '0', STR_PAD_LEFT);
    }

    protected function resolveOwnerColumns(Authenticatable $owner): array
    {
        if ($owner instanceof User) {
            // `orders.user_id` references `users.id`.
            // Even if the app authenticates Users by `phone`, we must store the DB primary key.
            return [
                'staff_id' => null,
                'user_id' => (int) $owner->getKey(),
            ];
        }


        if ($owner instanceof Staff) {
            // `orders.staff_id` references `staff.id`.
            return [
                'staff_id' => (int) $owner->getKey(),
                'user_id' => null,
            ];
        }


        throw ValidationException::withMessages([
            'user' => ['The current account type cannot create orders.'],
        ]);
    }

    protected function resolveCustomerId(array $data): ?int
    {
        if (! empty($data['customer_id'])) {
            return (int) $data['customer_id'];
        }

        $name = trim((string) ($data['customer_name'] ?? ''));

        if ($name === '') {
            return null;
        }

        $phone = $this->nullableText($data['customer_phone'] ?? null);
        $address = $this->nullableText($data['customer_address'] ?? null);

        $customer = null;

        if ($phone !== null) {
            $customer = Customer::query()->where('phone', $phone)->first();
        }

        if (! $customer) {
            $customer = Customer::query()
                ->where('name', $name)
                ->when($phone === null, fn ($query) => $query->whereNull('phone'), fn ($query) => $query->where('phone', $phone))
                ->when($address === null, fn ($query) => $query->whereNull('address'), fn ($query) => $query->where('address', $address))
                ->first();
        }

        if ($customer) {
            $customer->update([
                'name' => $name,
                'phone' => $phone,
                'address' => $address,
                'is_active' => true,
            ]);

            return $customer->id;
        }

        return Customer::create([
            'name' => $name,
            'phone' => $phone,
            'address' => $address,
            'is_active' => true,
        ])->id;
    }

    protected function nullableText(mixed $value): ?string
    {
        $clean = trim((string) ($value ?? ''));

        return $clean !== '' ? $clean : null;
    }
}
