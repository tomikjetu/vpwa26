/**
 * Socket Event Contracts
 * Matches backend types/contracts/ definitions
 * This file provides typed payloads for all socket events
 */

import type {
  ChannelWithMembers,
  InviteEnriched,
  MemberEnriched,
  MessageBasic,
  MessageEmit,
  NotifStatus,
  TypingEntry,
  UserProfile,
  UserStatus,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// CHANNEL DTOs
// ═══════════════════════════════════════════════════════════════════════════════

/** Response payload for channel:list */
export interface ChannelListResponse {
  channels: ChannelWithMembers[];
}

/** Request payload for channel:create */
export interface ChannelCreateRequest {
  name: string;
  isPrivate?: boolean;
}

/** Response payload for channel:created */
export interface ChannelCreatedResponse {
  channel: ChannelWithMembers;
}

/** Request payload for channel:join */
export interface ChannelJoinRequest {
  name: string;
}

/** Response payload for channel:joined (to joining user) */
export interface ChannelJoinedResponse {
  userId: number;
  channel: ChannelWithMembers;
}

/** Request payload for channel:list-members */
export interface ChannelListMembersRequest {
  channelId: number;
}

/** Response payload for channel:list-members */
export interface ChannelListMembersResponse {
  channelId: number;
  members: MemberEnriched[];
}

/** Request payload for channel:listInvites */
export interface ChannelListInvitesRequest {
  channelId: number;
}

/** Response payload for channel:event (type: invites_list) */
export interface ChannelInvitesListEvent {
  type: 'invites_list';
  channelId: number;
  invited: Array<{
    id: number;
    userId: number;
    channelId: number;
    createdAt: string;
    user: { nick: string };
  }>;
}

/** Request payload for channel:cancel */
export interface ChannelCancelRequest {
  channelId: number;
}

/** Response payload for channel:left (to leaving user) */
export interface ChannelLeftResponse {
  channelId: number;
}

/** Broadcast payload for member:left */
export interface MemberLeftBroadcast {
  channelId: number;
  memberId: number;
}

/** Request payload for channel:quit */
export interface ChannelQuitRequest {
  channelId: number;
}

/** Broadcast payload for channel:deleted */
export interface ChannelDeletedBroadcast {
  channelId: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER DTOs
// ═══════════════════════════════════════════════════════════════════════════════

/** Broadcast payload for member:joined */
export interface MemberJoinedBroadcast {
  channelId: number;
  member: MemberEnriched;
}

/** Request payload for member:kick-vote */
export interface MemberKickVoteRequest {
  channelId: number;
  targetMemberId: number;
}

/** Broadcast payload for member:kick-voted */
export interface MemberKickVotedBroadcast {
  channelId: number;
  targetMemberId: number;
  voterId: number;
  voteCount: number;
}

/** Broadcast payload for member:kicked */
export interface MemberKickedBroadcast {
  channelId: number;
  memberId: number;
  userId: number;
  voteCount: number;
}

/** Request payload for member:notif-status:update */
export interface MemberNotifStatusUpdateRequest {
  channelId: number;
  status: NotifStatus;
}

/** Response payload for member:notif-status:updated */
export interface MemberNotifStatusUpdatedResponse {
  channelId: number;
  notifStatus: NotifStatus;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVITE DTOs
// ═══════════════════════════════════════════════════════════════════════════════

/** Response payload for invite:list */
export interface InviteListResponse {
  invites: InviteEnriched[];
}

/** Request payload for invite:create */
export interface InviteCreateRequest {
  channelId: number;
  nickname: string;
}

/** Response payload for invite:sent (to inviting user) */
export interface InviteSentResponse {
  invitedAt: string;
  channelName: string;
  inviteId: number;
  nickname: string;
}

/** Broadcast payload for channel:invite:received (to invited user) */
export interface InviteReceivedBroadcast {
  invitedAt: string;
  channelName: string;
  inviteId: number;
  channelId: number;
}

/** Request payload for invite:accept */
export interface InviteAcceptRequest {
  channelId: number;
}

/** Response payload for channel:invite:accepted (to accepting user) */
export interface InviteAcceptedResponse {
  channel: ChannelWithMembers;
  userId: number;
}

/** Request payload for invite:decline */
export interface InviteDeclineRequest {
  channelId: number;
}

/** Response payload for channel:invite:declined */
export interface InviteDeclinedResponse {
  channelId: number;
  userId: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE DTOs
// ═══════════════════════════════════════════════════════════════════════════════

/** Request payload for msg:list */
export interface MessageListRequest {
  channelId: number;
  offset: number;
}

/** Response payload for msg:list */
export interface MessageListResponse {
  messages: MessageBasic[];
}

/** File metadata for socket message (NOT the actual file) */
export interface FileMetadata {
  id?: number;
  name: string;
  mime_type: string;
  size: number;
  url?: string;
}

/** Request payload for msg:send */
export interface MessageSendRequest {
  channelId: number;
  content?: string;
  /** File metadata only - actual upload via HTTP */
  files?: FileMetadata[];
}

/** Broadcast payload for message:new */
export interface MessageNewBroadcast {
  channelId: number;
  message: MessageEmit;
  memberId: number;
}

/** Request payload for msg:typing */
export interface MessageTypingRequest {
  channelId: number;
  message: string;
}

/** Broadcast payload for msg:typing */
export interface MessageTypingBroadcast {
  channelId: number;
  typing: TypingEntry[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER DTOs
// ═══════════════════════════════════════════════════════════════════════════════

/** Request payload for user:status */
export interface UserStatusRequest {
  status: UserStatus;
}

/** Response payload for user:event (type: status_update_success) */
export interface UserStatusUpdateSuccessEvent {
  type: 'status_update_success';
  status: UserStatus;
}

/** Broadcast payload for user:event (type: user_state_changed) */
export interface UserStateChangedEvent {
  type: 'user_state_changed';
  userId: number;
  status: UserStatus;
  isConnected: boolean;
}

/** Response payload for user:event (type: profile) */
export interface UserProfileEvent {
  type: 'profile';
  user: UserProfile;
}

/** Union type for user:event payloads */
export type UserEvent = UserStatusUpdateSuccessEvent | UserStateChangedEvent | UserProfileEvent;

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR DTOs
// ═══════════════════════════════════════════════════════════════════════════════

/** Generic error event payload */
export interface ErrorResponse {
  error: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOCKET EVENT CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Client-to-Server socket events
 * Events the client emits to the server
 */
export const ClientSocketEvent = {
  // Channel events
  CHANNEL_LIST: 'channel:list',
  CHANNEL_CREATE: 'channel:create',
  CHANNEL_JOIN: 'channel:join',
  CHANNEL_LIST_MEMBERS: 'channel:list-members',
  CHANNEL_LIST_INVITES: 'channel:listInvites',
  CHANNEL_CANCEL: 'channel:cancel',
  CHANNEL_QUIT: 'channel:quit',

  // Member events
  MEMBER_KICK_VOTE: 'member:kick-vote',
  MEMBER_NOTIF_STATUS_UPDATE: 'member:notif-status:update',

  // Invite events
  INVITE_LIST: 'invite:list',
  INVITE_CREATE: 'invite:create',
  INVITE_ACCEPT: 'invite:accept',
  INVITE_DECLINE: 'invite:decline',

  // Message events
  MSG_LIST: 'msg:list',
  MSG_SEND: 'msg:send',
  MSG_TYPING: 'msg:typing',

  // User events
  USER_STATUS: 'user:status',
} as const;

export type ClientSocketEventType = (typeof ClientSocketEvent)[keyof typeof ClientSocketEvent];

/**
 * Server-to-Client socket events
 * Events the server emits to clients
 */
export const ServerSocketEvent = {
  // Channel events
  CHANNEL_LIST: 'channel:list',
  CHANNEL_CREATED: 'channel:created',
  CHANNEL_JOINED: 'channel:joined',
  CHANNEL_LIST_MEMBERS: 'channel:list-members',
  CHANNEL_EVENT: 'channel:event',
  CHANNEL_LEFT: 'channel:left',
  CHANNEL_DELETED: 'channel:deleted',

  // Member events
  MEMBER_JOINED: 'member:joined',
  MEMBER_LEFT: 'member:left',
  MEMBER_KICK_VOTED: 'member:kick-voted',
  MEMBER_KICKED: 'member:kicked',
  MEMBER_NOTIF_STATUS_UPDATED: 'member:notif-status:updated',

  // Invite events
  INVITE_LIST: 'invite:list',
  INVITE_SENT: 'invite:sent',
  CHANNEL_INVITE_RECEIVED: 'channel:invite:received',
  CHANNEL_INVITE_ACCEPTED: 'channel:invite:accepted',
  CHANNEL_INVITE_DECLINED: 'channel:invite:declined',

  // Message events
  MSG_LIST: 'msg:list',
  MESSAGE_NEW: 'message:new',
  MSG_TYPING: 'msg:typing',

  // User events
  USER_EVENT: 'user:event',

  // Error events
  ERROR: 'error',
} as const;

export type ServerSocketEventType = (typeof ServerSocketEvent)[keyof typeof ServerSocketEvent];

// ═══════════════════════════════════════════════════════════════════════════════
// SOCKET TYPED INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Maps client socket events to their request payload types
 */
export interface ClientToServerEvents {
  // Channel events
  [ClientSocketEvent.CHANNEL_LIST]: () => void;
  [ClientSocketEvent.CHANNEL_CREATE]: (data: ChannelCreateRequest) => void;
  [ClientSocketEvent.CHANNEL_JOIN]: (data: ChannelJoinRequest) => void;
  [ClientSocketEvent.CHANNEL_LIST_MEMBERS]: (data: ChannelListMembersRequest) => void;
  [ClientSocketEvent.CHANNEL_LIST_INVITES]: (data: ChannelListInvitesRequest) => void;
  [ClientSocketEvent.CHANNEL_CANCEL]: (data: ChannelCancelRequest) => void;
  [ClientSocketEvent.CHANNEL_QUIT]: (data: ChannelQuitRequest) => void;

  // Member events
  [ClientSocketEvent.MEMBER_KICK_VOTE]: (data: MemberKickVoteRequest) => void;
  [ClientSocketEvent.MEMBER_NOTIF_STATUS_UPDATE]: (data: MemberNotifStatusUpdateRequest) => void;

  // Invite events
  [ClientSocketEvent.INVITE_LIST]: () => void;
  [ClientSocketEvent.INVITE_CREATE]: (data: InviteCreateRequest) => void;
  [ClientSocketEvent.INVITE_ACCEPT]: (data: InviteAcceptRequest) => void;
  [ClientSocketEvent.INVITE_DECLINE]: (data: InviteDeclineRequest) => void;

  // Message events
  [ClientSocketEvent.MSG_LIST]: (data: MessageListRequest) => void;
  [ClientSocketEvent.MSG_SEND]: (data: MessageSendRequest) => void;
  [ClientSocketEvent.MSG_TYPING]: (data: MessageTypingRequest) => void;

  // User events
  [ClientSocketEvent.USER_STATUS]: (data: UserStatusRequest) => void;
}

/**
 * Maps server socket events to their response payload types
 */
export interface ServerToClientEvents {
  // Channel events
  [ServerSocketEvent.CHANNEL_LIST]: (data: ChannelListResponse) => void;
  [ServerSocketEvent.CHANNEL_CREATED]: (data: ChannelCreatedResponse) => void;
  [ServerSocketEvent.CHANNEL_JOINED]: (data: ChannelJoinedResponse) => void;
  [ServerSocketEvent.CHANNEL_LIST_MEMBERS]: (data: ChannelListMembersResponse) => void;
  [ServerSocketEvent.CHANNEL_EVENT]: (data: ChannelInvitesListEvent) => void;
  [ServerSocketEvent.CHANNEL_LEFT]: (data: ChannelLeftResponse) => void;
  [ServerSocketEvent.CHANNEL_DELETED]: (data: ChannelDeletedBroadcast) => void;

  // Member events
  [ServerSocketEvent.MEMBER_JOINED]: (data: MemberJoinedBroadcast) => void;
  [ServerSocketEvent.MEMBER_LEFT]: (data: MemberLeftBroadcast) => void;
  [ServerSocketEvent.MEMBER_KICK_VOTED]: (data: MemberKickVotedBroadcast) => void;
  [ServerSocketEvent.MEMBER_KICKED]: (data: MemberKickedBroadcast) => void;
  [ServerSocketEvent.MEMBER_NOTIF_STATUS_UPDATED]: (data: MemberNotifStatusUpdatedResponse) => void;

  // Invite events
  [ServerSocketEvent.INVITE_LIST]: (data: InviteListResponse) => void;
  [ServerSocketEvent.INVITE_SENT]: (data: InviteSentResponse) => void;
  [ServerSocketEvent.CHANNEL_INVITE_RECEIVED]: (data: InviteReceivedBroadcast) => void;
  [ServerSocketEvent.CHANNEL_INVITE_ACCEPTED]: (data: InviteAcceptedResponse) => void;
  [ServerSocketEvent.CHANNEL_INVITE_DECLINED]: (data: InviteDeclinedResponse) => void;

  // Message events
  [ServerSocketEvent.MSG_LIST]: (data: MessageListResponse) => void;
  [ServerSocketEvent.MESSAGE_NEW]: (data: MessageNewBroadcast) => void;
  [ServerSocketEvent.MSG_TYPING]: (data: MessageTypingBroadcast) => void;

  // User events
  [ServerSocketEvent.USER_EVENT]: (data: UserEvent) => void;

  // Error events
  [ServerSocketEvent.ERROR]: (data: ErrorResponse) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOCKET AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Socket handshake auth payload
 */
export interface SocketAuth {
  token: string;
}

/**
 * Socket authentication error codes
 */
export const SocketAuthError = {
  NO_TOKEN: 'Authentication error: No token provided',
  INVALID_TOKEN: 'Authentication error: Invalid token',
  TOKEN_EXPIRED: 'Authentication error: Token expired',
  AUTH_ERROR: 'Authentication error',
} as const;

export type SocketAuthErrorType = (typeof SocketAuthError)[keyof typeof SocketAuthError];
