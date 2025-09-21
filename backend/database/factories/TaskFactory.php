<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Team;
use App\Models\Contact;
use App\Models\Deal;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
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
            'assignee_id' => User::factory(),
            'contact_id' => Contact::factory(),
            'deal_id' => Deal::factory(),
            'title' => $this->faker->sentence(3),
            'priority' => $this->faker->randomElement(['low', 'normal', 'high']),
            'due_on' => $this->faker->dateTimeBetween('now', '+30 days'),
            'done_at' => $this->faker->optional()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}

