import { useUserStore } from '@/stores/user'


export const authenticate = () => {
  const userStore = useUserStore()

  if (!userStore.isLoggedIn) return { name: 'Login' }

  return true
}

export const loggedIn = () => {
  const userStore = useUserStore()

  if (userStore.isLoggedIn) return { name: 'Home' }

  return true
}

export const authorize = () => {
  const userStore = useUserStore()

  if (!userStore.isAdmin) return { name: 'Home' }

  return true
}