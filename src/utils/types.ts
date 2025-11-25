export type Channel = {
  id: number;
  ownerId: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  joinedAt: Date;
  description?: string;
  icon: string;
  color: string;
  infoColor: string;
  isPrivate: boolean;
  hasUnreadMsgs: boolean;
  members: Record<number, Member>;
};

export type ChannelInvite = {
  id: number;
  channelId: number;
  name: string;
  invitedAt: Date;
  description?: string;
  icon: string;
  color: string;
};

/*
  Currently logged in user
*/
export type UserStatus = 'online' | 'dnd' | 'offline';

export type User = {
  id: number /** contact id */;
  name: string;
  surname: string;
  nickName: string;
  email: string;
  status?: UserStatus;
};

/*
  Every contact, including the logged in user contact
*/
export type Contact = {
  id: number /** contact id */;
  status: string;
};

export type Member = {
  id: number /** contact id */;
  userId: number;
  nickname: string;
  kickVotes: number;
  isOwner: boolean;
  currentlyTyping?: string;
  receivedKickVotes: number[];
  status: UserStatus;
};

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

export interface ServerReplyMsg {
    id: number;
    content: string;
    createdAt: Date;
    channelId: number;
    memberId: number;
    files: {
        name: string;
        mime: string;
        size: number;
        id: number;
    }[];
    user: {
        id: number;
        nick: string;
    };
}

export interface ServerReplyMember {
  id: number;
  channel_id: number;
  is_owner: boolean;
  user_id: number;
  user: {
    nick: string;
  }
}