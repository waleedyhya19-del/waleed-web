export const resourceCacheKeys = {
  currentUser: 'users:me',
  dashboardOverview: 'dashboard:overview',
  reportsList: 'reports:list',
  reportDetail: (id: string) => `reports:detail:${id}`,
  usersList: 'users:list',
  userDetail: (id: string) => `users:detail:${id}`,
  moderatorsList: 'moderators:list',
  moderatorDetail: (id: string) => `moderators:detail:${id}`,
  settingsProfile: 'settings:profile',
} as const;
