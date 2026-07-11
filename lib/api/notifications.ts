// lib/api/notifications.ts

export interface NotificationItem {
  id: string;
  is_read: boolean;
  created_at: string;
  type: 'like' | 'follow' | 'comment' | 'gift';
  message: string;
  entity_id: string;
  actor: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  unread_count: number;
}

interface ReadResponse {
  success: boolean;
}

interface UnreadCountResponse {
  count: number;
}

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || '';

// 获取通知列表
export const fetchNotifications = ({
  userId,
  limit = 20,
  offset = 0,
}: {
  userId: string;
  limit?: number;
  offset?: number;
}): Promise<NotificationsResponse> =>
  fetch(`${API_BASE}/api/notifications?user_id=${userId}&limit=${limit}&offset=${offset}`).then((r) =>
    r.json()
  );

// 标记已读
export const markNotificationsRead = ({
  userId,
  ids,
}: {
  userId: string;
  ids: string[];
}): Promise<ReadResponse> =>
  fetch(`${API_BASE}/api/notifications/read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, ids }),
  }).then((r) => r.json());

// 获取未读数量
export const getUnreadCount = ({
  userId,
}: {
  userId: string;
}): Promise<UnreadCountResponse> =>
  fetch(`${API_BASE}/api/notifications/unread-count?user_id=${userId}`).then((r) => r.json());