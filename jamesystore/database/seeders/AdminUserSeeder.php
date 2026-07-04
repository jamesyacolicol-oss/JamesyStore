<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Jamesy Acolicol',
                'username' => 'jamesy',
                'email' => 'jamesyacolicol@gmail.com',
                'phone' => '09289230563',
                'password' => 'admin@123',
            ],
            [
                'name' => 'Rachel Acolicol',
                'username' => 'rachel',
                'email' => 'rachelacolicol@gmail.com',
                'phone' => '09170000011',
                'password' => 'admin123',
            ],
            [
                'name' => 'Thelma Acolicol',
                'username' => 'thelma',
                'email' => 'thelmaacolicol@gmail.com',
                'phone' => '09275306366',
                'password' => 'admin123',
            ],
            [
                'name' => 'Glace Acolicol',
                'username' => 'glace',
                'email' => 'glaceacolicol@gmail.com',
                'phone' => '09170000013',
                'password' => 'admin123',
            ],
            [
                'name' => 'Michelle Acolicol',
                'username' => 'michelle',
                'email' => 'michelleacolicol@gmail.com',
                'phone' => '09170000014',
                'password' => 'admin123',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'username' => $user['username'],
                    'phone' => $user['phone'],
                    'email_verified_at' => now(),
                    'password' => Hash::make($user['password']),
                ]
            );
        }
    }
}

