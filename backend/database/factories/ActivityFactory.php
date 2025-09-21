<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Team;
use App\Models\Contact;
use App\Models\Deal;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Activity>
 */
class ActivityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'user_id' => User::factory(),
            'contact_id' => Contact::factory(),
            'deal_id' => Deal::factory(),
            'type' => $this->faker->randomElement(['call', 'meeting', 'mail', 'note']),
            'occurred_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'body' => $this->faker->paragraph(),
        ];
    }
}

