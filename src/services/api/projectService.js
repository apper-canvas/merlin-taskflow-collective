const mockProjects = [
  {
    id: 'proj_1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design and improved user experience',
    status: 'active',
    startDate: '2024-01-15T00:00:00.000Z',
    endDate: '2024-03-15T00:00:00.000Z',
    budget: 75000,
    actualSpend: 42000,
    teamMembers: ['John Doe', 'Sarah Wilson', 'Mike Chen'],
    createdAt: '2024-01-15T09:00:00.000Z',
    updatedAt: '2024-01-20T14:30:00.000Z'
  },
  {
    id: 'proj_2',
    name: 'Mobile App Development',
    description: 'Native iOS and Android app for customer engagement and service delivery',
    status: 'active',
    startDate: '2024-01-10T00:00:00.000Z',
    endDate: '2024-06-10T00:00:00.000Z',
    budget: 120000,
    actualSpend: 95000,
    teamMembers: ['Emma Johnson', 'David Kim', 'Lisa Zhang'],
    createdAt: '2024-01-10T11:00:00.000Z',
    updatedAt: '2024-01-22T16:45:00.000Z'
  },
  {
    id: 'proj_3',
    name: 'Data Analytics Platform',
    description: 'Build comprehensive analytics dashboard for business intelligence and reporting',
    status: 'on-hold',
    startDate: '2024-01-05T00:00:00.000Z',
    endDate: '2024-05-05T00:00:00.000Z',
    budget: 85000,
    actualSpend: 32000,
    teamMembers: ['Robert Taylor', 'Nina Patel'],
    createdAt: '2024-01-05T08:30:00.000Z',
    updatedAt: '2024-01-18T10:15:00.000Z'
  },
  {
    id: 'proj_4',
    name: 'Customer Portal',
    description: 'Self-service portal for customers to manage accounts and access support',
    status: 'completed',
    startDate: '2023-12-01T00:00:00.000Z',
    endDate: '1/15/2024 12:00:00 AMZ',
    budget: 55000,
    actualSpend: 52000,
    teamMembers: ['Alex Rodriguez', 'Jenny Liu', 'Tom Anderson'],
    createdAt: '2023-12-01T09:00:00.000Z',
    updatedAt: '2024-01-15T17:00:00.000Z'
  },
  {
    id: 'proj_5',
    name: 'Inventory Management System',
    description: 'Automated system for tracking and managing product inventory across multiple locations',
    status: 'active',
    startDate: '2024-01-08T00:00:00.000Z',
    endDate: '2024-04-08T00:00:00.000Z',
    budget: 95000,
    actualSpend: 68000,
    teamMembers: ['Carlos Santos', 'Amy Foster'],
    createdAt: '2024-01-08T10:00:00.000Z',
    updatedAt: '2024-01-21T13:20:00.000Z'
  }
];

let projects = [...mockProjects];

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const projectService = {
  async getAll() {
    await delay(200);
    return [...projects];
  },

  async getById(id) {
    await delay(200);
    const project = projects.find(p => p.id === id);
    if (!project) {
      throw new Error('Project not found');
    }
    return { ...project };
  },

  async create(projectData) {
    await delay(300);
    
const newProject = {
      id: `proj_${Date.now()}`,
      ...projectData,
      budget: projectData.budget || 0,
      actualSpend: projectData.actualSpend || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    projects.push(newProject);
    return { ...newProject };
  },

  async update(id, projectData) {
    await delay(300);
    
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found');
    }
    
    projects[index] = {
      ...projects[index],
      ...projectData,
      updatedAt: new Date().toISOString()
    };
    
    return { ...projects[index] };
  },

  async delete(id) {
    await delay(200);
    
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found');
    }
    
    projects.splice(index, 1);
    return true;
  }
};
export default projectService;