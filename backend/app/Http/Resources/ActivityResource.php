<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
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
            'type' => $this->type,
            'occurred_at' => $this->occurred_at->format('Y-m-d H:i:s'),
            'body' => $this->body,
            'user' => new UserResource($this->whenLoaded('user')),
            'contact' => new ContactResource($this->whenLoaded('contact')),
            'deal' => new DealResource($this->whenLoaded('deal')),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}

