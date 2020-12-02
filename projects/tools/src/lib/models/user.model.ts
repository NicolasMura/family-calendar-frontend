export class User {
  mobile?: string;
  email: string;
  profile: {
    name: string,
    gender?: string,
    picture?: string
  };
  // tslint:disable-next-line: variable-name
  _id?: string;

  constructor(
    mobile: string,
    email: string,
    profile: { name: string },
    // tslint:disable-next-line: variable-name
    _id?: string
  ) {
    this.mobile = mobile;
    this.email = email;
    this.profile = profile;
    this._id = _id;
  }
}
