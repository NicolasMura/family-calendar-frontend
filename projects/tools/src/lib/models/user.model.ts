export class User {
  // tslint:disable-next-line: variable-name
  _id: string;
  mobile?: string;
  email: string;
  profile: {
    name: string,
    gender?: string,
    picture?: string
  };

  constructor(
    // tslint:disable-next-line: variable-name
    _id: string,
    mobile: string,
    email: string,
    profile: { name: string }
  ) {
    this._id = _id;
    this.mobile = mobile;
    this.email = email;
    this.profile = profile;
  }
}
