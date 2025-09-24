<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Team;
use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Deal>
 */
class DealFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $stage = $this->faker->randomElement(['lead', 'qualify', 'proposal', 'negotiation', 'won', 'lost']);

        $fakerJa = \Faker\Factory::create('ja_JP');

        return [
            'team_id' => Team::factory(),
            'owner_id' => User::factory(),
            'contact_id' => Contact::factory(),
            'title' => $fakerJa->realText(10),
            'amount' => $this->faker->numberBetween(10000, 10000000),
            'stage' => $stage,
            'probability' => $this->faker->numberBetween(0, 100),
            'expected_close_on' => $this->faker->optional()->dateTimeBetween('now', '+90 days'),
            'order_index' => $this->faker->numberBetween(10, 1000),
            'lost_reason' => $stage === 'lost' ? $fakerJa->realText(15) : null,
        ];
    }
}
