import categoriesData from '../mockData/categories.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let categories = [...categoriesData];

const categoryService = {
  async getAll() {
    await delay(200);
    return [...categories];
  },

  async getById(id) {
    await delay(150);
    const category = categories.find(cat => cat.id === id);
    if (!category) {
      throw new Error('Category not found');
    }
    return { ...category };
  },

  async create(categoryData) {
    await delay(300);
    const newCategory = {
      id: Date.now().toString(),
      ...categoryData
    };
    categories.push(newCategory);
    return { ...newCategory };
  },

  async update(id, categoryData) {
    await delay(250);
    const index = categories.findIndex(cat => cat.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    const updatedCategory = {
      ...categories[index],
      ...categoryData,
      id
    };
    
    categories[index] = updatedCategory;
    return { ...updatedCategory };
  },

  async delete(id) {
    await delay(200);
    const index = categories.findIndex(cat => cat.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    categories.splice(index, 1);
    return { success: true };
  }
};

export default categoryService;