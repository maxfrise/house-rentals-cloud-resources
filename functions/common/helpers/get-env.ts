import { Stage } from "../types";

export const getEnv = (stage?: string): Stage => {
  if (stage === "prod") return Stage.PROD;
  else return Stage.TEST;
};
