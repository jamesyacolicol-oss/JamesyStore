<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ProductController extends Controller
{
            public function index(Request $request): View
        {
            $search = trim((string) $request->string('search'));
            $categoryFilter = trim((string) $request->string('category'));
            $user = auth()->user();
            $isAdmin = $user instanceof \App\Models\User;
    
            $productsQuery = Product::query();

            // Category filter
            if ($categoryFilter) {
                $productsQuery->where('category', $categoryFilter);
            }

            // Search filter
            $productsQuery->when($search !== '', function ($query) use ($search) {
                $query->where(function ($builder) use ($search) {
                    $builder
                        ->orWhere('name', 'like', '%' . $search . '%')
                        ->orWhere('description', 'like', '%' . $search . '%')
                        ->orWhere('category', 'like', '%' . $search . '%');
                });
            });

            // FIX: Apply alphabetical order LAST before getting results
            $products = $productsQuery->orderBy('name', 'asc')->get();

            $categories = Product::query()
                ->whereNotNull('category')
                ->distinct()
                ->pluck('category')
                ->sort()
                ->values();

            $view = $isAdmin ? 'auth.admin.product' : 'auth.staff.product';

            return view($view, compact('products', 'search', 'categories', 'categoryFilter'));
        }

        public function store(ProductRequest $request): RedirectResponse
        {
            // Create the product and capture the object
            $product = Product::create($request->validated());

            return redirect()
                ->route('products.index')
                ->with('success', 'Product created successfully.')
                // Pass the ID so the view knows which one is "New"
                ->with('newly_added_id', $product->id);
        }
    public function create(): View
    {
        return view('products.form', [
            'product' => new Product(),
        ]);
    }

   
    public function edit(Product $product): View
    {
        return view('products.form', compact('product'));
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        return redirect()
            ->route('products.index')
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $user = auth()->user();
        $isAdmin = $user instanceof \App\Models\User;

        if (! $isAdmin) {
            abort(403, 'Only admins can delete products.');
        }

        $product->delete();

        return redirect()
            ->route('products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
