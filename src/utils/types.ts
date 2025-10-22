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
  isPublic: boolean;
  hasUnreadMsgs: boolean;
  members: Record<number, Member>;
};

/*
  Currently logged in user
*/
export type UserStatus = 'online' | 'dnd' | 'offline'

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
  nickname: string;
  kickVotes: number;
  isOwner: boolean;
  currentlyTyping?: string;
  kickVoters: number[];
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
  user: number;
  text: string;
  time: Date;
  files: (File | string)[];
  userNickname: string;
}
