export class User {
  mobile?: string;
  email: string;
  profile: {
    name: string,
    gender?: string,
    picture?: string
  };

  constructor(mobile: string, email: string, profile: { name: string }) {
    this.mobile = mobile;
    this.email = email;
    this.profile = profile;
  }
}
