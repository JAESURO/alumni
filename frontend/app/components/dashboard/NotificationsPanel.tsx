import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, X, Activity, Sprout, CloudRain } from 'lucide-react';

export interface Notification {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    category: 'system' | 'crop' | 'weather' | 'activity';
    title: string;
    message: string;
    timestamp: Date;
    dismissed: boolean;
}

interface NotificationsPanelProps {
    notifications: Notification[];
    onDismiss: (id: string) => void;
    onClearAll: () => void;
}

export default function NotificationsPanel({
    notifications,
    onDismiss,
    onClearAll
}: NotificationsPanelProps) {
    const [filter, setFilter] = useState<'all' | 'system' | 'crop' | 'weather' | 'activity'>('all');

    const filteredNotifications = notifications.filter(n =>
        !n.dismissed && (filter === 'all' || n.category === filter)
    );

    const getIcon = (type: string, category: string) => {
        if (category === 'crop') return <Sprout className="w-5 h-5" />;
        if (category === 'weather') return <CloudRain className="w-5 h-5" />;
        if (category === 'activity') return <Activity className="w-5 h-5" />;

        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5" />;
            case 'warning': return <AlertTriangle className="w-5 h-5" />;
            case 'error': return <AlertTriangle className="w-5 h-5" />;
            default: return <Info className="w-5 h-5" />;
        }
    };

    const getColorClasses = (type: string) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50 border-green-200',
                    icon: 'text-green-600',
                    title: 'text-green-900',
                    text: 'text-green-700'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50 border-yellow-200',
                    icon: 'text-yellow-600',
                    title: 'text-yellow-900',
                    text: 'text-yellow-700'
                };
            case 'error':
                return {
                    bg: 'bg-red-50 border-red-200',
                    icon: 'text-red-600',
                    title: 'text-red-900',
                    text: 'text-red-700'
                };
            default:
                return {
                    bg: 'bg-blue-50 border-blue-200',
                    icon: 'text-blue-600',
                    title: 'text-blue-900',
                    text: 'text-blue-700'
                };
        }
    };

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-green-600" />
                    <span>Notifications & Alerts</span>
                    {filteredNotifications.length > 0 && (
                        <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {filteredNotifications.length}
                        </span>
                    )}
                </h2>
                {filteredNotifications.length > 0 && (
                    <button
                        onClick={onClearAll}
                        className="text-sm text-gray-500 hover:text-red-600 transition"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 mb-4 overflow-x-auto">
                {['all', 'system', 'crop', 'weather', 'activity'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filter === f
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No notifications</p>
                        <p className="text-sm">You're all caught up!</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => {
                        const colors = getColorClasses(notification.type);
                        return (
                            <div
                                key={notification.id}
                                className={`border rounded-lg p-4 ${colors.bg} transition-all hover:shadow-md`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3 flex-1">
                                        <div className={colors.icon}>
                                            {getIcon(notification.type, notification.category)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className={`font-semibold text-sm ${colors.title}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                                                    {formatTimestamp(notification.timestamp)}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${colors.text}`}>
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onDismiss(notification.id)}
                                        className="ml-2 text-gray-400 hover:text-gray-600 transition flex-shrink-0"
                                        title="Dismiss"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
