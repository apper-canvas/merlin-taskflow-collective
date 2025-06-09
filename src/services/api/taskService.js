import tasksData from '../mockData/tasks.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let tasks = [...tasksData];

const taskService = {
  async getAll() {
    await delay(300);
    return [...tasks];
  },

  async getById(id) {
    await delay(200);
    const task = tasks.find(task => task.id === id);
    if (!task) {
      throw new Error('Task not found');
    }
    return { ...task };
  },

  async create(taskData) {
    await delay(400);
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    tasks.unshift(newTask);
    return { ...newTask };
  },

  async update(id, taskData) {
    await delay(300);
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...tasks[index],
      ...taskData,
      id // Ensure ID doesn't get overwritten
    };
    
    tasks[index] = updatedTask;
    return { ...updatedTask };
  },

  async delete(id) {
    await delay(250);
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    tasks.splice(index, 1);
    return { success: true };
  }
};

export default taskService;