export class User {
  email: string;
  profile?: {
    name: string,
    gender: string,
    picture: string
  };

  constructor(email: string) {
    this.email = email;
  }
}
