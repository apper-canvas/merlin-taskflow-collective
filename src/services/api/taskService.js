import tasksData from '../mockData/tasks.json';
import { addDays, addWeeks, addMonths, startOfDay, isAfter, format } from 'date-fns';

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
    
    // Handle recurring tasks
    if (taskData.isRecurring && taskData.recurringConfig) {
      const recurringTasks = generateRecurringTasks(taskData);
      tasks.unshift(...recurringTasks);
      return recurringTasks;
    }
    
    // Handle single task
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

// Helper function to generate recurring task instances
const generateRecurringTasks = (taskData) => {
  const { recurringConfig, ...baseTask } = taskData;
  const generatedTasks = [];
  
  const start = startOfDay(new Date(recurringConfig.startDate));
  const end = recurringConfig.endType === 'date' ? startOfDay(new Date(recurringConfig.endDate)) : null;
  let current = start;
  let taskCounter = 0;

  while ((!end || !isAfter(current, end)) && taskCounter < 100) { // Limit to prevent infinite loops
    let shouldInclude = false;
    
    switch (recurringConfig.pattern) {
      case 'daily':
        shouldInclude = true;
        break;
      case 'weekly':
        const dayName = format(current, 'EEEE').toLowerCase();
        shouldInclude = recurringConfig.daysOfWeek.includes(dayName);
        break;
      case 'monthly':
        shouldInclude = current.getDate() === recurringConfig.dayOfMonth;
        break;
    }

    if (shouldInclude) {
      const taskId = `${Date.now()}-${taskCounter}`;
      const newTask = {
        ...baseTask,
        id: taskId,
        dueDate: current.toISOString(),
        createdAt: new Date().toISOString(),
        completedAt: null,
        recurringTaskId: Date.now().toString(), // Group related recurring tasks
        recurringInstance: taskCounter + 1
      };
      generatedTasks.push(newTask);
      taskCounter++;
    }

    // Move to next potential occurrence
    switch (recurringConfig.pattern) {
      case 'daily':
        current = addDays(current, recurringConfig.frequency);
        break;
      case 'weekly':
        current = addDays(current, 1);
        break;
      case 'monthly':
        current = addDays(current, 1);
        break;
    }

    // Safety check to prevent infinite loops
    if (taskCounter === 0 && isAfter(current, addMonths(start, 12))) {
      break;
    }
  }

  return generatedTasks;
};

export default taskService;