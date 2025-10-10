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
