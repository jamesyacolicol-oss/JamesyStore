<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class AdminProductApiController extends Controller
{
    public function index()
    {
        return Product::with('category')->orderBy('product_id', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_code'   => 'required|string|max:50|unique:products,product_code',
            'product_name'   => 'required|string|max:100',
            'category_name'  => 'required|string|max:100',
            'price'          => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $category = Category::firstOrCreate(
                ['category_name' => trim($validated['category_name'])],
                ['description' => 'Auto-created via product panel']
            );

            $product = Product::create([
                'product_code'   => $validated['product_code'],
                'product_name'   => $validated['product_name'],
                'category_id'    => $category->category_id,
                'price'          => $validated['price'],
                'stock_quantity' => $validated['stock_quantity'],
            ]);

            return response()->json(['success' => true, 'product' => $product], 201);
        });
    }

    // UPDATE METHOD (Edit)
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'product_name'   => 'required|string|max:100',
            'category_name'  => 'required|string|max:100',
            'price'          => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
        ]);

        return DB::transaction(function () use ($product, $validated) {
            $category = Category::firstOrCreate(
                ['category_name' => trim($validated['category_name'])],
                ['description' => 'Auto-created via product panel']
            );

            $product->update([
                'product_name'   => $validated['product_name'],
                'category_id'    => $category->category_id,
                'price'          => $validated['price'],
                'stock_quantity' => $validated['stock_quantity'],
            ]);

            return response()->json(['success' => true, 'product' => $product]);
        });
    }

    // DELETE METHOD
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['success' => true, 'message' => 'Product deleted successfully']);
    }

    public function nextCode()
    {
        $lastProduct = Product::where('product_code', 'like', 'PRD-%')
            ->orderByRaw('CAST(SUBSTRING(product_code, 5) AS UNSIGNED) DESC')
            ->first();

        $nextNumber = $lastProduct ? (int)preg_replace('/[^0-9]/', '', $lastProduct->product_code) + 1 : 1001;
        
        return response()->json(['product_code' => 'PRD-' . $nextNumber]);
    }
}