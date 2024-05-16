export interface ApiResponse {
  meta: {
      status: string
      code: number
      message?: string
      total?: number
  };
  data: any;
}