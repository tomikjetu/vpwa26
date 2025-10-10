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
  isFolder: boolean;
};
export type User = {
  id: string;
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
