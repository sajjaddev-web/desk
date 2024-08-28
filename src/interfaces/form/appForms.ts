export interface IRegisterAppForm {
  email: string;
  name: string;
  password: string;
}

export interface ILoginAppForm {
  identifier: string;
  password: string;
}

export interface IUpdateAppForm {
  name?: string;
  password?: string;
}
