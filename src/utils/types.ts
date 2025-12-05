// ═══════════════════════════════════════════════════════════════════════════════
// CORE TYPES (matching backend contracts/entities.ts)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Notification status for channel members
 * - 'all': receive all notifications
 * - 'mentions': only receive notifications when mentioned
 */
export type NotifStatus = 'all' | 'mentions';

/**
 * User presence status (user-selectable)
 * - 'active': available and receiving notifications
 * - 'dnd': Do Not Disturb - no notifications
 * Note: online/offline are connection states (isConnected), not user statuses
 */
export type UserStatus = 'active' | 'dnd';

// ═══════════════════════════════════════════════════════════════════════════════
// USER TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Basic user info */
export interface UserBasic {
  id: number;
  nick: string;
}

/** User with status info (used in member lists) */
export interface UserWithStatus extends UserBasic {
  status: UserStatus;
  isConnected: boolean;
}

/** Full user profile */
export interface UserProfile extends UserWithStatus {
  email: string;
  firstName: string;
  lastName: string;
}

/** Auth user from login response (snake_case from backend) */
export interface AuthUser {
  id: number;
  nick: string;
  email: string;
  first_name: string;
  last_name: string;
}

/** Frontend User type (normalized from AuthUser) */
export type User = {
  id: number;
  name: string;
  surname: string;
  nickName: string;
  email: string;
  status?: UserStatus;
};

// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Basic member info */
export interface MemberBasic {
  id: number;
  userId: number;
  channelId: number;
  isOwner: boolean;
  joinedAt: string;
  kickVotes: number;
  notif_status: NotifStatus;
}

/** Enriched member with user status (from backend MemberEnriched) */
export interface MemberEnriched extends MemberBasic {
  status: UserStatus;
  isConnected: boolean;
  nickname: string;
  receivedKickVotes: number[];
}

/** Frontend Member type (extends MemberEnriched with UI state) */
export interface Member extends MemberEnriched {
  currentlyTyping?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHANNEL TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Basic channel info */
export interface ChannelBasic {
  id: number;
  name: string;
  isPrivate: boolean;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

/** Channel with members (from backend ChannelWithMembers) */
export interface ChannelWithMembers extends ChannelBasic {
  members: Record<number, MemberEnriched>;
  notifStatus: NotifStatus;
}

/** Frontend Channel type (extends ChannelWithMembers with UI state) */
export type Channel = ChannelWithMembers & {
  description?: string;
  icon: string;
  color: string;
  infoColor: string;
  hasUnreadMsgs: boolean;
  members: Record<number, Member>;
};

// ═══════════════════════════════════════════════════════════════════════════════
// INVITE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** Basic invite info */
export interface InviteBasic {
  id: number;
  userId: number;
  channelId: number;
  createdAt: string;
}

/** Enriched invite (from backend InviteEnriched) */
export interface InviteEnriched extends InviteBasic {
  channelName: string;
}

/** Frontend ChannelInvite type (for invite notifications UI) */
export type ChannelInvite = {
  id: number;
  channelId: number;
  name: string;
  invitedAt: Date;
  description?: string;
  icon: string;
  color: string;
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** File attachment (from backend FileAttachment) */
export interface FileAttachment {
  id: number;
  name: string;
  mime_type: string;
  size: number;
}

/** Basic message (from backend MessageBasic) */
export interface MessageBasic {
  id: number;
  content: string;
  createdAt: string;
  channelId: number;
  memberId: number;
  files: FileAttachment[];
  user: UserBasic;
}

/** Message emit type (for new messages from backend MessageEmit) */
export interface MessageEmit extends MessageBasic {
  mentions: number[];
}

/** Typing entry for typing indicator */
export interface TypingEntry {
  memberId: number;
  message: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT TYPES (legacy - consider deprecating)
// ═══════════════════════════════════════════════════════════════════════════════

/** Contact (legacy type) */
export type Contact = {
  id: number;
  status: string;
};

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  surname: string;
  nickName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// ═══════════════════════════════════════════════════════════════════════════════
// UI TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DropdownItem {
  label: string;
  class: string;
  disable: boolean;
}

export interface ChatMessagePayload {
  id?: number;
  user: number;
  text: string;
  time: Date;
  files: string[];
  userNickname: string | undefined;
}
