export interface RegisterData {
  message: string;
  user: {
    id: number;
    nick: string;
    email: string;
  };
  sessionToken: string;
}
