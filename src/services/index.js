import taskService from '@/services/api/taskService.js'
import categoryService from '@/services/api/categoryService.js'
import projectService from '@/services/api/projectService.js'

// Re-export services with consistent naming
export { taskService }
export { categoryService }
export { projectService }

// Legacy aliases for backward compatibility
export const taskServiceAlt = taskService
export const categoryServiceAlt = categoryService
export const projectServiceAlt = projectService

// Default export of all services as an object for bulk importing
export default {
  taskService,
  categoryService,
  projectService
};