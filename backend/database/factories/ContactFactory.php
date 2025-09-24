<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Contact>
 */
class ContactFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fakerJa = \Faker\Factory::create('ja_JP');
        $type = $this->faker->randomElement(['person', 'company']);

        return [
            'team_id' => Team::factory(),
            'owner_id' => User::factory(),
            'type' => $type,
            'name' => $type === 'person'
                ? $fakerJa->name()
                : $fakerJa->company(),
            'company' => $type === 'person' ? $this->faker->optional()->company() : null,
            'email' => $this->faker->optional()->safeEmail(),
            'phone' => $this->faker->optional()->phoneNumber(),
            'tags' => $this->faker->optional()->randomElements(
                ['VIP', '新規', '既存', 'ホットリード', 'コールドリード'],
                $this->faker->numberBetween(1, 3)
            ),
            'priority' => $this->faker->randomElement(['low', 'normal', 'high']),
            'note' => $this->faker->optional()->paragraph(),
            'next_action_on' => $this->faker->optional()->dateTimeBetween('now', '+30 days'),
            'last_contacted_at' => $this->faker->optional()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
