import { StatusCodes } from "../types";

export const MaxfriseErrorCodes = {
  missingInfo: {
    code: StatusCodes.badRequest,
    message: "MISSING_INFO",
  },
  errorFromDynamo: {
    code: StatusCodes.error,
    message: "DB_ERROR",
  },
  unrecognizedAction: {
    code: StatusCodes.badRequest,
    message: "UNRECOGNIZED_ACTION",
  },
};
