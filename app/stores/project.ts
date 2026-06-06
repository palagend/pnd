export const useProjectStore = defineStore('project', () => {
  const projects = ref([])

  const addProject = (project: any) => {
    projects.value.push(project)
  }

  const updateProject = (id: string, project: any) => {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = project
    }
  }

  const deleteProject = (id: string) => {
    projects.value = projects.value.filter(p => p.id !== id)
  }

  return {
    projects,
    addProject,
    updateProject,
    deleteProject
  }
}, {
  persist: true
})
