export interface RegisterData {
  message: string;
  user: {
    id: number;
    nick: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  sessionToken: string;
}

export interface LoginData {
  message: string;
  user: {
    id: number;
    nick: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  sessionToken: string;
}
