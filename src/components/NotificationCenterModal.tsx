import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  Check,
  RefreshCw,
  X,
  ArrowRight,
} from 'lucide-react';
import type { PushUpdateNotification } from '../utils/waharakaLogic';

export interface NotificationSubscriptions {
  sermons: boolean;
  cds: boolean;
  magazines: boolean;
  books: boolean;
}

interface NotificationCenterModalProps {
  isOpen: boolean;
  notifications: PushUpdateNotification[];
  subscriptions: NotificationSubscriptions;
  pushEnabled: boolean;
  onClose: () => void;
  onTogglePushEnabled: () => void;
  onToggleSubscription: (key: keyof NotificationSubscriptions) => void;
  onMarkAllRead: () => void;
  onCheckLiveUpdates: () => Promise<void>;
  onSelectNotificationTarget: (notif: PushUpdateNotification) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  notifications,
  subscriptions,
  pushEnabled,
  onClose,
  onTogglePushEnabled,
  onToggleSubscription,
  onMarkAllRead,
  onCheckLiveUpdates,
  onSelectNotificationTarget,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onCheckLiveUpdates();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Push Notifications & Waharaka Updates"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif-display">
              Push Notifications & Archive Updates
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications modal"
            className="min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Push Permission & Channel Subscriptions */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Android & Browser Push Alerts
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Receive instant alerts when new Poya Deshana audio, CDs, or Hela Bodu Piyuma magazines are published on Waharaka.com.
                </p>
              </div>
              <button
                type="button"
                onClick={onTogglePushEnabled}
                aria-pressed={pushEnabled}
                className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  pushEnabled
                    ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                    : 'bg-amber-800 text-white dark:bg-amber-600 dark:text-stone-950'
                }`}
              >
                {pushEnabled ? 'Push Alerts Active' : 'Enable Push Alerts'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-200/80 dark:border-stone-800">
              {(
                [
                  { key: 'sermons', label: 'New Sermons' },
                  { key: 'cds', label: 'CD Releases' },
                  { key: 'magazines', label: 'Magazines' },
                  { key: 'books', label: 'New Books' },
                ] as const
              ).map((item) => {
                const active = subscriptions[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onToggleSubscription(item.key)}
                    aria-pressed={active}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between border transition-colors ${
                      active
                        ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-amber-700/50 dark:border-amber-500/50 font-semibold'
                        : 'bg-stone-100/60 dark:bg-stone-900 text-stone-500 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    {active && <Check className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feed Actions */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
              Recent Waharaka Archive Updates ({notifications.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Checking Waharaka.com...' : 'Check for Updates'}</span>
              </button>
              <button
                type="button"
                onClick={onMarkAllRead}
                className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              >
                Mark all read
              </button>
            </div>
          </div>

          {/* Notification Items */}
          <div className="divide-y divide-stone-200 dark:divide-stone-800 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 flex items-start justify-between gap-4 ${
                  !notif.read
                    ? 'bg-amber-50/40 dark:bg-amber-950/20'
                    : 'bg-white dark:bg-stone-900'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-mono-tabular">
                    <Bell className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span className="capitalize font-sans font-semibold text-stone-700 dark:text-stone-300">
                      {notif.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{notif.publishedAt}</span>
                    {!notif.read && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-sans font-semibold text-amber-800 dark:text-amber-400">
                          New
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {notif.title}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                    {notif.body}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectNotificationTarget(notif)}
                  className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-1 shrink-0"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
