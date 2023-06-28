export type AgenciesRequest = {
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  ownerId: string,
  agencyId?: string,
  address?: string
  name?: string,
  phone?: string
};
