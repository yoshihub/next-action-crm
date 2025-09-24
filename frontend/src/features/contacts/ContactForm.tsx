import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Contact } from '../../app/types';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const schema = z.object({
  type: z.enum(['person', 'company']),
  name: z.string().min(1, '名前は必須です').max(255),
  company: z.string().optional(),
  email: z.string().email('有効なメールアドレス').optional().or(z.literal('')),
  phone: z.string().optional(),
  next_action_on: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  note: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<Contact>;
  onSubmit: (values: ContactFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}

const ContactForm: React.FC<Props> = ({ defaultValues, onSubmit, onCancel, submitLabel = '保存' }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: (defaultValues?.type as 'person' | 'company') ?? 'person',
      name: defaultValues?.name ?? '',
      company: defaultValues?.company ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      next_action_on: defaultValues?.next_action_on ?? '',
      priority: 'normal',
      note: defaultValues?.note ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">タイプ</label>
          <select className="mt-1 border rounded w-full px-2 py-2" {...register('type')}>
            <option value="person">個人</option>
            <option value="company">企業</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">名前</label>
          <Input {...register('name')} />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">会社</label>
          <Input {...register('company')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">メール</label>
          <Input type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message as string}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">電話</label>
          <Input {...register('phone')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">次回フォロー日</label>
          <Input type="date" {...register('next_action_on')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">優先度</label>
          <select className="mt-1 border rounded w-full px-2 py-2" {...register('priority')}>
            <option value="high">high</option>
            <option value="normal">normal</option>
            <option value="low">low</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">メモ</label>
        <textarea className="mt-1 border rounded w-full px-2 py-2" rows={4} {...register('note')} />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>キャンセル</Button>
        )}
        <Button type="submit" disabled={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
};

export default ContactForm;
