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
};
export type User = {
  id: number;
  name: string;
  surname: string;
  nickName: string;
  email: string;
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
  label: string,
  class: string,
  disable: boolean
}

export interface ChatMessagePayload {
  user: string,
  text: string,
  time: string,
  files: File[]
}

export interface File {
  name: string
}