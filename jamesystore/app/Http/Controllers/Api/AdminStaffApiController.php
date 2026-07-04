<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Staff;
use Illuminate\Support\Facades\Hash;

class AdminStaffApiController extends Controller
{
    // GET /api/admin/staff
    public function index()
    {
        // Use the Eloquent model instead of raw DB queries
        $staff = Staff::all();
        return response()->json($staff);
    }

    // POST /api/admin/staff
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|size:11|unique:staff,phone', // Matches your frontend requirement
            'password' => 'required|string|min:6', // Password mandatory for new staff
        ]);

        // Safely divide name properties for your extra descriptive columns
        $parts = explode(' ', trim($request->name), 2);
        $firstName = $parts[0];
        $lastName = $parts[1] ?? '';

        // Leverage your model properties directly
        $staff = Staff::create([
            'name' => trim($request->name),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'is_active' => $request->input('is_active', 1),
            'role_id' => 1,
        ]);

        return response()->json(['success' => true, 'id' => $staff->staff_id], 201);
    }

    // PUT /api/admin/staff/{id}
    public function update(Request $request, $id)
    {
        // Target staff_id explicitly
        $staff = Staff::where('staff_id', $id)->firstOrFail();

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|size:11|unique:staff,phone,' . $staff->staff_id . ',staff_id',
            'password' => 'nullable|string|min:6',
        ]);

        $parts = explode(' ', trim($request->name), 2);
        $firstName = $parts[0];
        $lastName = $parts[1] ?? '';

        $updateData = [
            'name' => trim($request->name),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'phone' => $request->phone,
            'is_active' => $request->input('is_active', $staff->is_active),
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $staff->update($updateData);

        return response()->json(['success' => true]);
    }

    // DELETE /api/admin/staff/{id}
    public function destroy($id)
    {
        // Target staff_id explicitly
        Staff::where('staff_id', $id)->delete();
        return response()->json(['success' => true]);
    }
}