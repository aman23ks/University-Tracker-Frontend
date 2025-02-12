export const storage = {
    get: (key: string) => {
      if (typeof window === 'undefined') return null
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (error) {
        console.error(`Error reading from localStorage: ${key}`, error)
        return null
      }
    },
  
    set: (key: string, value: any) => {
      if (typeof window === 'undefined') return
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error(`Error writing to localStorage: ${key}`, error)
      }
    },
  
    remove: (key: string) => {
      if (typeof window === 'undefined') return
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error(`Error removing from localStorage: ${key}`, error)
      }
    },
  
    clear: () => {
      if (typeof window === 'undefined') return
      try {
        localStorage.clear()
      } catch (error) {
        console.error('Error clearing localStorage', error)
      }
    },
  
    setWithExpiry: (key: string, value: any, ttl: number) => {
      if (typeof window === 'undefined') return
      const item = {
        value,
        expiry: new Date().getTime() + ttl,
      }
      storage.set(key, item)
    },
  
    getWithExpiry: (key: string) => {
      const item = storage.get(key)
      if (!item) return null
  
      if (new Date().getTime() > item.expiry) {
        storage.remove(key)
        return null
      }
      return item.value
    }
  }