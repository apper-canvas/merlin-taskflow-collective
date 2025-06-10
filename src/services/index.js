// Barrel exports for service layer - all services use default exports
import taskServiceDefault from './api/taskService.js';
import categoryServiceDefault from './api/categoryService.js';
import projectServiceDefault from './api/projectService.js';

// Re-export as named exports for convenient importing
export const taskService = taskServiceDefault;
export const categoryService = categoryServiceDefault;
export const projectService = projectServiceDefault;

// Also support default exports for backward compatibility
export { default as taskServiceDefault } from './api/taskService.js';
export { default as categoryServiceDefault } from './api/categoryService.js';
export { default as projectServiceDefault } from './api/projectService.js';

// Default export of all services as an object for bulk importing
export default {
  taskService: taskServiceDefault,
  categoryService: categoryServiceDefault,
  projectService: projectServiceDefault
};