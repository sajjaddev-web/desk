type AppError = {
  errorMessage: string;
};

type AppSuccess = {
  successMessage: string;
  token: string;
  app: any; // Consider using a more specific type if possible
};

export interface IAppRegisterAndLoginResult {
  error: boolean;
  status: number;
  data: AppError | AppSuccess;
}

export interface IAppActivationResult {
  error: boolean;
  message: string;
  status: number;
}

export interface IAppDeleteResult {
  error: boolean;
  message: string;
  status: number;
}
