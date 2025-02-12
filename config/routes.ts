export const routes = {
    home: '/',
    login: '/auth/login',
    register: '/auth/register',
    adminDashboard: '/dashboard/admin',
    userDashboard: '/dashboard/user',
    profile: '/dashboard/user/profile',
    settings: '/dashboard/user/settings',
    universities: '/dashboard/user/universities',
    universityDetails: (id: string) => `/dashboard/universities/${id}`,
  } as const
  
  export const protectedRoutes = [
    '/dashboard/admin',
    '/dashboard/user',
    '/dashboard/user/profile',
    '/dashboard/user/settings',
    '/dashboard/user/universities',
    '/dashboard/universities'
  ]
  
  export const adminRoutes = [
    '/dashboard/admin'
  ]
  
  export function isProtectedRoute(path: string): boolean {
    return protectedRoutes.some(route => path.startsWith(route))
  }
  
  export function isAdminRoute(path: string): boolean {
    return adminRoutes.some(route => path.startsWith(route))
  }