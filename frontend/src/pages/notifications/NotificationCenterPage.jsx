import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  ShieldAlert, 
  Info, 
  Award, 
  Calendar, 
  Trash2,
  Filter,
  Check
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { notificationApi } from '../../api/notificationApi';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';

export const NotificationCenterPage = () => {
  const { addToast } = useToast();
  const { fetchNotifications } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, urgent

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getAll();
      setNotifications(res.data?.items || res.data || []);
    } catch (err) {
      addToast(err.message || 'Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      fetchNotifications();
      addToast('Notification marked as read', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update notification', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      fetchNotifications();
      addToast('All notifications marked as read', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to mark all as read', 'error');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'urgent') return n.type === 'critical' || n.type === 'alert' || n.priority === 'high';
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'critical':
      case 'incident':
      case 'alert':
        return <ShieldAlert className="w-5 h-5 text-danger-600" />;
      case 'positive':
      case 'merit':
        return <Award className="w-5 h-5 text-emerald-600" />;
      case 'attendance':
        return <Calendar className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-primary-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        subtitle="Stay informed on student behavior updates, attendance alerts, and institutional messages"
        action={
          unreadCount > 0 && (
            <Button variant="secondary" icon={CheckCheck} onClick={handleMarkAllRead}>
              Mark All as Read
            </Button>
          )
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            filter === 'all'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            filter === 'unread'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('urgent')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            filter === 'urgent'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Alerts & Critical
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading your notifications..." />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You are all caught up! No recent alerts or updates found in this view."
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                notif.is_read
                  ? 'bg-white border-neutral-200 opacity-80'
                  : 'bg-primary-50/40 border-primary-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-white rounded-lg shadow-sm border border-neutral-100 flex-shrink-0">
                  {getNotificationIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm ${notif.is_read ? 'font-semibold text-neutral-800' : 'font-bold text-neutral-900'}`}>
                      {notif.title}
                    </h4>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary-600" />
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {notif.created_at ? new Date(notif.created_at).toLocaleString() : 'Recent'}
                    </span>
                    {notif.type && (
                      <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                        {notif.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1 p-1.5 hover:bg-primary-100/60 rounded-lg transition-all"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Mark Read</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
