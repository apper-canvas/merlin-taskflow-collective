import mockDeals from '@/services/mockData/deals.json';

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for demo purposes
let deals = [...mockDeals];

export const dealsService = {
  // Get all deals
  async getAll() {
    await delay(300);
    return [...deals];
  },

  // Get deal by ID
  async getById(id) {
    await delay(200);
    const deal = deals.find(d => d.id === id);
    if (!deal) {
      throw new Error('Deal not found');
    }
    return { ...deal };
  },

  // Create new deal
async create(dealData) {
    await delay(400);
    
    const newDeal = {
      ...dealData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    deals.unshift(newDeal);
    return { ...newDeal };
  },

// Update existing deal
  async update(id, dealData) {
    await delay(400);
    
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Deal not found');
    }
    
    const updatedDeal = {
      ...deals[index],
      ...dealData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    deals[index] = updatedDeal;
    return { ...updatedDeal };
  },

  // Delete deal
  async delete(id) {
    await delay(300);
    
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Deal not found');
    }
    
    deals.splice(index, 1);
    return { success: true };
  },

  // Get deals by category
  async getByCategory(category) {
    await delay(250);
    const filteredDeals = deals.filter(deal => deal.category === category);
    return [...filteredDeals];
  },

  // Get featured deals
  async getFeatured() {
    await delay(200);
    const featuredDeals = deals.filter(deal => deal.featured);
    return [...featuredDeals];
  },

  // Get active deals (not expired)
  async getActive() {
    await delay(250);
    const today = new Date();
    const activeDeals = deals.filter(deal => new Date(deal.expiryDate) > today);
    return [...activeDeals];
  },

  // Search deals
  async search(query) {
    await delay(300);
    const searchQuery = query.toLowerCase();
    const searchResults = deals.filter(deal =>
      deal.title.toLowerCase().includes(searchQuery) ||
      deal.description.toLowerCase().includes(searchQuery) ||
      deal.category.toLowerCase().includes(searchQuery)
    );
    return [...searchResults];
  }
};