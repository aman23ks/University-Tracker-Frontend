export const checkAuth = () => {
    if (typeof window === 'undefined') return null
    
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/auth/login'
      return null
    }
    
    return token
  }
  
  export const checkAdminAuth = () => {
    if (typeof window === 'undefined') return null
    
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (!token || !userStr) {
      window.location.href = '/auth/login'
      return null
    }
    
    const user = JSON.parse(userStr)
    if (!user.is_admin) {
      window.location.href = '/dashboard/user'
      return null
    }
    
    return { token, user }
  }