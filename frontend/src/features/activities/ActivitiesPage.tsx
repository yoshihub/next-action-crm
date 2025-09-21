import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../app/apiClient';
import { Activity } from '../../app/types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SearchIcon as Search, PlusIcon as Plus, PhoneIcon as Phone, MailIcon as Mail, UsersIcon as Users, FileTextIcon as FileText, CalendarIcon as Calendar, UserIcon as User } from '../../components/icons/Icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const ActivitiesPage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ['activities', searchKeyword, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchKeyword) params.append('keyword', searchKeyword);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await apiClient.get(`/activities?${params.toString()}`);
      return response.data;
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'meeting':
        return <Users className="h-4 w-4" />;
      case 'mail':
        return <Mail className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'call':
        return '電話';
      case 'meeting':
        return '面談';
      case 'mail':
        return 'メール';
      case 'note':
        return 'ノート';
      default:
        return 'ノート';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-blue-100 text-blue-800';
      case 'meeting':
        return 'bg-green-100 text-green-800';
      case 'mail':
        return 'bg-yellow-100 text-yellow-800';
      case 'note':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">活動ログ</h1>
          <p className="mt-1 text-sm text-gray-500">
            すべての活動履歴を管理します
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          新規作成
        </Button>
      </div>

      {/* 検索・フィルター */}
      <Card>
        <CardHeader>
          <CardTitle>検索・フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                キーワード検索
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="活動内容で検索"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タイプ
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">すべて</option>
                <option value="call">電話</option>
                <option value="meeting">面談</option>
                <option value="mail">メール</option>
                <option value="note">ノート</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 活動ログ一覧 */}
      <div className="space-y-4">
        {activitiesData?.data?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">活動ログがありません</h3>
              <p className="mt-1 text-sm text-gray-500">
                新しい活動ログを作成してください
              </p>
            </CardContent>
          </Card>
        ) : (
          activitiesData?.data?.map((activity: Activity) => (
            <Card key={activity.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-full ${getTypeColor(activity.type)}`}>
                      {getTypeIcon(activity.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(activity.type)}>
                          {getTypeLabel(activity.type)}
                        </Badge>
                        {activity.user && (
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-1" />
                            {activity.user.name}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(activity.occurred_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {activity.body}
                      </p>
                    </div>

                    {(activity.contact || activity.deal) && (
                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                        {activity.contact && (
                          <div className="flex items-center">
                            <span className="text-gray-400">連絡先:</span>
                            <span className="ml-1 font-medium">{activity.contact.name}</span>
                          </div>
                        )}
                        {activity.deal && (
                          <div className="flex items-center">
                            <span className="text-gray-400">商談:</span>
                            <span className="ml-1 font-medium">{activity.deal.title}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ページネーション */}
      {activitiesData?.pagination && activitiesData.pagination.last_page > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              前へ
            </Button>
            <Button variant="outline" size="sm">
              次へ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage;
