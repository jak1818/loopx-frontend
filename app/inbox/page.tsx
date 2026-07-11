'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchNotifications, markNotificationsRead, NotificationItem } from '@/lib/api/notifications';
import styles from './page.module.css';
import { useAppData } from '@/providers/AppDataProvider'; // 新增

export default function InboxPage() {
  const [list, setList] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const listRef = useRef<NotificationItem[]>([]);
  const loadingRef = useRef(false);

  // 🔥 获取当前用户 ID
  const { telegramUser, webUser } = useAppData();
  const userId = telegramUser?.id || webUser?.id;

const load = useCallback(async (reset: boolean = false) => {
  if (!userId || loadingRef.current) return;
  loadingRef.current = true;
  setLoading(true);

  const currentOffset = reset ? 0 : offsetRef.current;
  try {
    const res = await fetchNotifications({ userId, limit: 20, offset: currentOffset });
    const notifications = res.notifications || [];          // 👈 防御性取值
    const newList = reset
      ? notifications
      : [...listRef.current, ...notifications];
    setList(newList);
    listRef.current = newList;
    setHasMore(notifications.length === 20);
    offsetRef.current = currentOffset + notifications.length;

    const unreadIds = notifications
      .filter(n => !n.is_read)
      .map(n => n.id);
    if (unreadIds.length) {
      markNotificationsRead({ userId, ids: unreadIds }).catch(console.error);
    }
  } catch (err) {
    console.error('Failed to load notifications:', err);
  } finally {
    setLoading(false);
    loadingRef.current = false;
  }
}, [userId]);

  useEffect(() => {
    if (userId) load(true);
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = () => {
    if (hasMore && !loadingRef.current) load();
  };



  const handleClick = (item: NotificationItem) => {
  
    if (item.type === 'follow') {
      window.location.href = `/profile/${item.actor.id}`;
    } 
	 else if (
    item.type === "nft_gift"
  ) {

    window.location.href =
      "/creator/assets";

  }
	
	else {
      window.location.href = `/video/${item.entity_id}`;
    }
  };

const formatTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr);

    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );

    const now = new Date();

    const diffMs = now.getTime() - localDate.getTime();

    const mins = Math.floor(diffMs / 60000);

    if (mins < 1) return 'just now';

    if (mins < 60) return `${mins}m ago`;

    const hours = Math.floor(mins / 60);

    if (hours < 24) return `${hours}h ago`;

    return `${Math.floor(hours / 24)}d ago`;
  } catch {
    return '';
  }
};

  return (
    <div className={styles.inboxPage}>
      <h2 className={styles.header}>Notifications</h2>

      {list.length === 0 && !loading && (
        <p className={styles.emptyText}>No notifications yet</p>
      )}

      <div>
        {list.map((item) => (
          <div
            key={item.id}
            className={`${styles.notificationItem} ${!item.is_read ? styles.unread : ''}`}
            onClick={() => handleClick(item)}
          >
            <img
              src={item.actor.avatar_url || '/default-avatar.png'}
              alt={item.actor.username}
              className={styles.actorAvatar}
            />
            <div className={styles.notificationContent}>
              <p className={styles.notificationText}>
                <strong>{item.actor.username}</strong> {item.message}
              </p>
              <span className={styles.notificationTime}>{formatTime(item.created_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button onClick={loadMore} disabled={loading} className={styles.loadMoreBtn}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}

      {loading && list.length === 0 && <p className={styles.loadingText}>Loading...</p>}
    </div>
  );
}