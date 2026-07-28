<?php

namespace Database\Seeders;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;


class AdminStaffSeeder extends Seeder
{
    public function run(): void
    {
        // Admins (User model uses phone as auth identifier)
        $admins = [

            [
                'name' => 'Jamesy Acolicol',
                'email' => 'jamesyacolicol@gmail.com',
                'phone' => '09289230563',
                'password' => 'admin@123',
            ],
            [
                'name' => 'Rachel Acolicol',
                'email' => 'rachelacolicol@gmail.com',
                'phone' => '09170000011',
                'password' => 'admin123',
            ],
            [
                'name' => 'Thelma Acolicol',
                'email' => 'thelmaacolicol@gmail.com',
                'phone' => '09170000012',
                'password' => 'admin123',
            ],
            [
                'name' => 'Glace Acolicol',
                'email' => 'glaceacolicol@gmail.com',
                'phone' => '09170000013',
                'password' => 'admin123',
            ],
            [
                'name' => 'Michelle Acolicol',
                'email' => 'michelleacolicol@gmail.com',
                'phone' => '09170000014',
                'password' => 'admin123',
            ],
        ];

        foreach ($admins as $admin) {
            User::updateOrCreate(
                ['email' => $admin['email']],
                [
                    'name' => $admin['name'],
                    'phone' => $admin['phone'],
                    'password' => Hash::make($admin['password']),
                ]
            );
        }

        // Staff
        // NOTE: your actual `staff` table columns (from phpMyAdmin) are:
        // staff_id, role_id, first_name, last_name, email, phone, status, hired_at, password_hash
        $staff = [
            [
                'role_id' => 1,
                'first_name' => 'Maria',
                'last_name' => 'Reyes',
                'email' => 'maria.reyes@example.com',
                'phone' => '09171234501',
                'password' => 'staff@123',
                'status' => 'Active',
                'hired_at' => '2020-06-01 08:00:00',
            ],
        ];

        foreach ($staff as $s) {
            Staff::updateOrCreate(
                ['phone' => $s['phone']],
                [
                    'role_id' => $s['role_id'],
                    'first_name' => $s['first_name'],
                    'last_name' => $s['last_name'],
                    'email' => $s['email'],
                    'password_hash' => Hash::make($s['password']),
                    'status' => $s['status'],
                    'hired_at' => $s['hired_at'],
                ],
            );
        }

    }
}


