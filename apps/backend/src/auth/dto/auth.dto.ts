export class SignupDto {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export class LoginDto {
  username: string;
  password: string;
}
