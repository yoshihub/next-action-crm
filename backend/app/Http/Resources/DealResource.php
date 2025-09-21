<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DealResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'amount' => $this->amount,
            'stage' => $this->stage,
            'probability' => $this->probability,
            'expected_close_on' => $this->expected_close_on?->format('Y-m-d'),
            'order_index' => $this->order_index,
            'lost_reason' => $this->lost_reason,
            'archived_at' => $this->archived_at?->format('Y-m-d H:i:s'),
            'contact' => new ContactResource($this->whenLoaded('contact')),
            'owner' => new UserResource($this->whenLoaded('owner')),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}

