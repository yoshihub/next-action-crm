<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
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
            'priority' => $this->priority,
            'due_on' => $this->due_on->format('Y-m-d'),
            'done_at' => $this->done_at?->format('Y-m-d H:i:s'),
            'is_completed' => !is_null($this->done_at),
            'is_overdue' => $this->due_on < today() && is_null($this->done_at),
            'assignee' => new UserResource($this->whenLoaded('assignee')),
            'contact' => new ContactResource($this->whenLoaded('contact')),
            'deal' => new DealResource($this->whenLoaded('deal')),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}

