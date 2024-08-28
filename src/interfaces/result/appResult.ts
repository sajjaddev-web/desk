export type AppError = {
  errorMessage: string;
};

export type AppSuccess = {
  successMessage: string;

  token: string;
  app: any; // Consider using a more specific type if possible
};

export interface IAppRegisterResult {
  error: boolean;
  status: number;
  data: AppError | AppSuccess;
}
