export interface ApiResponse {
  meta: {
      status: string
      code: number
      message?: string
  };
  data: any;
}