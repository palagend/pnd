export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)

  const login = async (credentials: any) => {
    // 登录逻辑
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
  }

  return {
    user,
    isAuthenticated,
    login,
    logout
  }
}, {
  persist: true
})
