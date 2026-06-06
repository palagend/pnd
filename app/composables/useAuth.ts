export const useAuth = () => {
  const user = ref(null)
  const isAuthenticated = ref(false)

  return {
    user,
    isAuthenticated
  }
}
