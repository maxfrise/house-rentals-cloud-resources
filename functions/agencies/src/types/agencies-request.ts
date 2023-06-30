export enum AgencyStatus {
  archived = 'archived',
  hidden = 'hidden',
  visible = 'visible'
};

export type AgenciesRequest = {
  action: 'CREATE' | 'UPDATE' | 'STATUS',
  ownerId: string,
  agencyId?: string,
  address?: string
  name?: string,
  phone?: string,
  status?: AgencyStatus
};
