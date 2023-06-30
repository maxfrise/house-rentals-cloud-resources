
export type AgenciesFailure = {
  errorMessage: string;
};

export type AgenciesSuccess = {
  agencyId: string;
};

export type AgenciesResponse = {
  response: AgenciesSuccess | AgenciesFailure;
};
