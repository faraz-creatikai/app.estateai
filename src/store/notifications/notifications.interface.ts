export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entityId: string;
  entityType: string;
  receiverId: string;
  senderId: string;
  isRead: boolean;
  metadata: Record<string, string>;
  createdAt: string;
}