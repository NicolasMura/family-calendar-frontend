export class LoginResponse {
  status: number;
  logged: boolean;
  token: string;
  message: string;

  constructor(status: number, logged: boolean, token: string, message: string) {
    this.status = status;
    this.logged = logged;
    this.token = token;
    this.message = message;
  }
}
