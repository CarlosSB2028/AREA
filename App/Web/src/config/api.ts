import { env } from "process";

export const API_CONFIG = {
  baseURL: typeof window !== 'undefined' && window.location.origin && window.location.origin.includes('areaaaaaaaaaaaaaaaaaaa.space')
    ? ''
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'),
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
      me: '/api/auth/me',
      status: '/api/auth/status',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password',
      verifyEmail: '/api/auth/verify',
      providers: '/api/oauth/providers',
      oauth: '/api/auth/oauth/',
      link: '/api/oauth-link/',
    },
    user: {
      getUserById: '/api/users',
      profile: '/api/users',
      avatar: '/api/users/avatar',
      getUser: '/api/auth/me',
      serviceConnection: '/api/user/service-connection',
      connectedServices: '/api/user/connected-services'
    },
    areas: {
      list: '/api/areas',
      create: '/api/areas',
      createWithActions: '/api/areas/with-links',
      update: '/api/areas/',
      updateComplete: '/api/areas/',
      delete: '/api/areas/',
      getById: '/api/areas/',
      cards: '/api/areas/',
      run: '/api/areas/',
    },
    services: {
      list: '/api/services',
      catalog: '/api/services/catalog',
      search: '/api/services/search',
      getById: '/api/services/',
      actions: '/api/action-definitions/service/',
      actionFields: '/api/services/',
    },
    actions: {
      create: '/api/actions',
      labels: '/api/services/labels',
      reactions: '/api/services/reactions',
      test: '/api/test/',
      actionDefinitions: '/api/action-definitions/'
    },
    admin: {
      userConnectedPerDay: '/api/admin/user-connected-per-day',
      newUserPerMonth: '/api/admin/new-user-per-month',
      users: '/api/admin/users',
      areas: '/api/admin/areas',
      services: '/api/admin/services',
      servicesUsage: '/api/admin/services-usage',
      logs: '/api/admin/logs',
      areaRuns: '/api/admin/area-runs',
      areaStats: '/api/admin/area-stats',
      cardUserData: '/api/admin/card-user-data'
    }
  }
};

export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

export const USE_MOCK_DATA = env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
