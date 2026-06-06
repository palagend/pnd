export const useBillStore = defineStore('bill', () => {
  const bills = ref([])

  const addBill = (bill: any) => {
    bills.value.push(bill)
  }

  const updateBill = (id: string, bill: any) => {
    const index = bills.value.findIndex(b => b.id === id)
    if (index !== -1) {
      bills.value[index] = bill
    }
  }

  const deleteBill = (id: string) => {
    bills.value = bills.value.filter(b => b.id !== id)
  }

  return {
    bills,
    addBill,
    updateBill,
    deleteBill
  }
}, {
  persist: true
})
