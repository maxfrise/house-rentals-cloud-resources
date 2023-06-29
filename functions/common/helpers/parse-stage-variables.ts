import { StageEnvironment } from "../types";

export const parseStageVariables = (env?: string): StageEnvironment => {
  if (!env) {
    return 'test';
  }

  if (env === 'prod') {
    return 'prod';
  }

  return 'test';
};
