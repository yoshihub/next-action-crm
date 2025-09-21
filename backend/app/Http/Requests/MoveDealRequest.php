<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MoveDealRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'to_stage' => 'required|in:lead,qualify,proposal,negotiation,won,lost',
            'to_index' => 'integer|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'to_stage.required' => '移動先ステージを選択してください。',
            'to_stage.in' => '有効なステージを選択してください。',
            'to_index.integer' => 'インデックスは整数で入力してください。',
            'to_index.min' => 'インデックスは0以上で入力してください。',
        ];
    }
}

