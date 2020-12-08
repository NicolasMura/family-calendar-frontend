export class User {
  mobile?: string;
  email: string;
  profile: {
    name: string,
    isChild?: boolean,
    gender?: string,
    location?: string,
    picture?: string
  };
  schtroumpfs?: User[] | undefined;
  // tslint:disable-next-line: variable-name
  _id?: string;

  constructor(
    mobile: string,
    email: string,
    profile: { name: string, isChild?: boolean },
    schtroumpfs?: User[],
    // tslint:disable-next-line: variable-name
    _id?: string
  ) {
    this.mobile = mobile;
    this.email = email;
    this.profile = profile;
    this.schtroumpfs = schtroumpfs;
    this._id = _id;
  }
}
