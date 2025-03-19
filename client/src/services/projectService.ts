import axios from '../api/axios';

export interface Project {
  idProj: number;
  name: string;
  description: string;
  salary: number;
  roles: string;
  open: boolean;
  employerId: number;
  // Frontend display properties
  company?: string;
  role?: string;
  employeeCount?: number;
}

export interface ProjectDTO {
  name: string;
  description: string;
  salary: number;
  roles: string;
  open?: boolean;
}

export interface ProjectApplicant {
  id: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  joinedAt: string;
  User?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface MyApplication {
  projectId: number;
  projectName: string;
  companyName: string;
  role: string;
  salary: number;
  appliedDate: string;
  status: 'pending' | 'accepted' | 'rejected';
  employerEmail?: string;
}

export interface ProjectApplicationDetails {
  applicationId: number;
  projectId: number;
  projectName: string;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  role: string;
  appliedDate: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const projectService = {
  // Get all projects
  getAllProjects: async (): Promise<Project[]> => {
    const response = await axios.get('/api/projects');
    return response.data;
  },

  // Get a specific project by ID
  getProjectById: async (id: number): Promise<Project> => {
    const response = await axios.get(`/api/projects/${id}`);
    return response.data;
  },

  // Create a new project (requires authentication)
  createProject: async (projectData: ProjectDTO): Promise<Project> => {
    const response = await axios.post('/api/projects', projectData);
    return response.data;
  },

  // Update a project (requires authentication)
  updateProject: async (id: number, projectData: Partial<ProjectDTO>): Promise<Project> => {
    const response = await axios.put(`/api/projects/${id}`, projectData);
    return response.data;
  },

  // Delete a project (requires authentication)
  deleteProject: async (id: number): Promise<void> => {
    await axios.delete(`/api/projects/${id}`);
  },

  // Apply to a project as an employee
  applyToProject: async (projectId: number): Promise<void> => {
    await axios.post(`/api/projects/${projectId}/apply`);
  },

  // Check if current user has already applied to a project
  hasAppliedToProject: async (projectId: number): Promise<boolean> => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/application-status`);
      return response.data.hasApplied;
    } catch (error) {
      console.error("Error checking application status:", error);
      return false;
    }
  },

  // Get all employees for a specific project (for employers)
  getProjectEmployees: async (projectId: number): Promise<ProjectApplicant[]> => {
    const response = await axios.get(`/api/projects/${projectId}/employees`);
    return response.data;
  },

  // Get employer projects (projects created by the logged-in employer)
  getEmployerProjects: async (): Promise<Project[]> => {
    const response = await axios.get('/api/projects/employer');
    return response.data;
  },

  // Get all applications for the current employee
  getMyApplications: async (): Promise<MyApplication[]> => {
    const response = await axios.get('/api/projects/applications/my');
    return response.data;
  },

  // Get all applicants across all projects for the employer
  getAllApplicants: async (): Promise<ProjectApplicationDetails[]> => {
    const response = await axios.get('/api/projects/applicants/all');
    return response.data;
  },
  
  // Update application status (accept/reject)
  updateApplicationStatus: async (applicationId: number, status: 'accepted' | 'rejected'): Promise<void> => {
    await axios.put(`/api/projects/applications/${applicationId}/status`, { status });
  }
};

export default projectService; 