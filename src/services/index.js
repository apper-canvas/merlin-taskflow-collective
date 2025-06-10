// Import default exports and re-export as named exports
import taskServiceDefault from './api/taskService';
import categoryServiceDefault from './api/categoryService';
import projectServiceDefault from './api/projectService';

// Re-export with consistent naming
export const taskService = taskServiceDefault;
export const categoryService = categoryServiceDefault;
export const projectService = projectServiceDefault;

// Also support default exports for backward compatibility
export { default as taskServiceDefault } from './api/taskService';
export { default as categoryServiceDefault } from './api/categoryService';
export { default as projectServiceDefault } from './api/projectService';