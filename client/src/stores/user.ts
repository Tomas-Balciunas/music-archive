import {
  clearStoredAccessToken,
  getStoredAccessToken,
  getUserIdFromToken,
  storeAccessToken,
} from '@/utils/auth'
import { trpc } from '@/trpc'
import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { IdentifierUser } from '@mono/server/src/shared/entities'

export const useUserStore = defineStore('user', () => {
  const authToken = ref(getStoredAccessToken(localStorage))
  const authUserId = computed(() => (authToken.value ? getUserIdFromToken(authToken.value) : null))
  const isLoggedIn = computed(() => !!authToken.value)
  const isAdmin = computed(() => userIdentifier.value?.role === 2)

  const userIdentifier = ref<IdentifierUser | null>()

  watch(
    isLoggedIn,
    async (loggedIn) => {
      if (loggedIn) {
        const res: IdentifierUser = await trpc.user.get.query()

        if (res) {
          userIdentifier.value = res
        }
      } else {
        userIdentifier.value = null
      }
    },
    { immediate: true }
  )

  async function login(userLogin: { email: string; password: string }) {
    const { accessToken } = await trpc.user.login.mutate(userLogin)

    authToken.value = accessToken
    storeAccessToken(localStorage, accessToken)
  }

  function logout() {
    authToken.value = null
    clearStoredAccessToken(localStorage)
  }

  // REMOVE ROLE AFTER REVIEW
  // REMOVE ROLE AFTER REVIEW
  // REMOVE ROLE AFTER REVIEW
  async function signup(userSignup: { username: string; email: string; password: string, role: number }) {
    await trpc.user.signup.mutate(userSignup)
  }

  return {
    authUserId,
    isLoggedIn,
    isAdmin,
    userIdentifier,
    login,
    logout,
    signup,
  }
})
