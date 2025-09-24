<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
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
            'type' => 'required|in:person,company',
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            // UI変更: スコア入力を廃止し、優先度を連絡先作成時に受け取る
            'priority' => 'required|in:low,normal,high',
            'note' => 'nullable|string',
            'next_action_on' => 'nullable|date|after_or_equal:today',
            'last_contacted_at' => 'nullable|date',
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
            'type.required' => 'タイプを選択してください。',
            'type.in' => '有効なタイプを選択してください。',
            'name.required' => '名前は必須です。',
            'name.max' => '名前は255文字以内で入力してください。',
            'email.email' => '有効なメールアドレスを入力してください。',
            'next_action_on.after_or_equal' => '次回アクション日は今日以降の日付を選択してください。',
        ];
    }
}
