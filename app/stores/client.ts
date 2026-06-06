export const useClientStore = defineStore('client', () => {
  const clients = ref([])

  const addClient = (client: any) => {
    clients.value.push(client)
  }

  const updateClient = (id: string, client: any) => {
    const index = clients.value.findIndex(c => c.id === id)
    if (index !== -1) {
      clients.value[index] = client
    }
  }

  const deleteClient = (id: string) => {
    clients.value = clients.value.filter(c => c.id !== id)
  }

  return {
    clients,
    addClient,
    updateClient,
    deleteClient
  }
}, {
  persist: true
})
