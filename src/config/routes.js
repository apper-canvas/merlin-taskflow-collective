import HomePage from '@/components/pages/HomePage';
import ArchivePage from '@/components/pages/ArchivePage';
import ProjectsPage from '@/components/pages/ProjectsPage';
import NotFoundPage from '@/components/pages/NotFoundPage';

export const routes = {
  home: {
    id: 'home',
    label: 'Work Items',
    path: '/',
    icon: 'CheckSquare',
    component: HomePage
  },
  projects: {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    icon: 'FolderOpen',
    component: ProjectsPage
  },
  archive: {
    id: 'archive',
    label: 'Archive',
    path: '/archive',
    icon: 'Archive',
    component: ArchivePage
  },
  notFound: {
    id: 'notFound',
    label: 'Not Found',
    path: '/404',
    icon: 'AlertCircle',
    component: NotFoundPage
  }
};

export const routeArray = Object.values(routes).filter(route => route.id !== 'notFound');