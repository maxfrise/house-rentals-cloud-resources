export enum StatusCodes {
  "ok" = 200,
  "error" = 500,
  "badRequest" = 400
};

export type Response = {
  isBase64Encoded: boolean,
  headers: {},
  statusCode: StatusCodes,
  body: string,
};