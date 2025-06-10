// Export all services from this central location
export { taskService } from './api/taskService';
export { projectService } from './api/projectService';
export { categoryService } from './api/categoryService';
export { dealsService } from './api/dealsService';
// Import default exports first for backward compatibility
import taskServiceDefault from './api/taskService.js';
import categoryServiceDefault from './api/categoryService.js';
import projectServiceDefault from './api/projectService.js';

// Re-export as named exports for convenient importing (using imported defaults)
export const taskServiceAlt = taskServiceDefault;
export const categoryServiceAlt = categoryServiceDefault;
export const projectServiceAlt = projectServiceDefault;

// Default export of all services as an object for bulk importing
export default {
  taskService: taskServiceDefault,
  categoryService: categoryServiceDefault,
  projectService: projectServiceDefault
};