<?php

namespace App\Providers;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Use standard Sanctum tokens
        Sanctum::usePersonalAccessTokenModel(\Laravel\Sanctum\PersonalAccessToken::class);

        // Dynamically shift target guards depending on the token owner's type
        Sanctum::authenticateAccessTokensUsing(function ($accessToken, bool $isValid) {
            if (! $isValid || ! $accessToken) {
                return false;
            }

            $tokenable = $accessToken->tokenable;

            if ($tokenable instanceof User) {
                config(['auth.defaults.guard' => 'sanctum-user']);
            } elseif ($tokenable instanceof Staff) {
                config(['auth.defaults.guard' => 'sanctum-staff']);
            }

            return $isValid;
        });
    }
}