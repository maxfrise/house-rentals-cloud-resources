export enum StatusCodes {
  "ok" = 200,
  "error" = 500,
  "badRequest" = 400
};

export type Response<ResponseBody> = {
  statusCode: StatusCodes,
  body: ResponseBody,
};