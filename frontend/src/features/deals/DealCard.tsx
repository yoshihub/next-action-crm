import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '../../app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../app/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../../components/ui/Badge';
import { DollarSignIcon as DollarSign, CalendarIcon as Calendar, UserIcon as User, TrendingUpIcon as TrendingUp, XIcon } from '../../components/icons/Icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface DealCardProps {
  deal: Deal;
}

const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'bg-green-100 text-green-800';
    if (probability >= 50) return 'bg-yellow-100 text-yellow-800';
    if (probability >= 20) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const queryClient = useQueryClient();
  const completeDealMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/deals/${deal.id}/complete`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      } relative`}
    >
      <button
        aria-label="完了"
        className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
        onClick={(e) => { e.stopPropagation(); completeDealMutation.mutate(); }}
      >
        <XIcon className="h-4 w-4" />
      </button>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium line-clamp-2">
          {deal.title}
        </CardTitle>
        <CardDescription className="text-xs">
          {deal.contact?.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm font-medium text-gray-900">
              <DollarSign className="h-3 w-3 mr-1" />
              {formatCurrency(deal.amount)}
            </div>
            <Badge className={`text-xs ${getProbabilityColor(deal.probability)}`}>
              {deal.probability}%
            </Badge>
          </div>

          {deal.expected_close_on && (
            <div className="flex items-center text-xs text-gray-600">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(deal.expected_close_on), 'MM/dd', { locale: ja })}
            </div>
          )}

          {deal.owner && (
            <div className="flex items-center text-xs text-gray-600">
              <User className="h-3 w-3 mr-1" />
              {deal.owner.name}
            </div>
          )}

          {deal.stage === 'lost' && deal.lost_reason && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
              <span className="font-medium">失注理由:</span> {deal.lost_reason}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DealCard;
