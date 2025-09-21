<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDealRequest extends FormRequest
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
            'contact_id' => 'required|exists:contacts,id',
            'title' => 'required|string|max:255',
            'amount' => 'integer|min:0',
            'stage' => 'in:lead,qualify,proposal,negotiation,won,lost',
            'probability' => 'integer|min:0|max:100',
            'expected_close_on' => 'nullable|date|after:today',
            'lost_reason' => 'nullable|string',
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
            'contact_id.required' => '連絡先を選択してください。',
            'contact_id.exists' => '選択された連絡先が存在しません。',
            'title.required' => 'タイトルは必須です。',
            'title.max' => 'タイトルは255文字以内で入力してください。',
            'amount.min' => '金額は0以上で入力してください。',
            'probability.min' => '確度は0以上で入力してください。',
            'probability.max' => '確度は100以下で入力してください。',
            'expected_close_on.after' => '予想クローズ日は今日より後の日付を選択してください。',
        ];
    }
}

