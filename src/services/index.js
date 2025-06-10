// Export all services from this central location
export { taskService } from './api/taskService';
export { projectService } from './api/projectService';
export { categoryService } from './api/categoryService';
export { dealsService } from './api/dealsService';

// Import default exports first for backward compatibility
export { default as taskServiceDefault } from './api/taskService.js';
export { default as categoryServiceDefault } from './api/categoryService.js';
export { default as projectServiceDefault } from './api/projectService.js';

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