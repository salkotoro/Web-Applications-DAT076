import { Project as ProjectModel } from "../models/Project";
import { Project } from "../../db/project.db";
import { User } from "../../db/user.db";

// Extended Project model to include company name
export interface ExtendedProjectModel extends ProjectModel {
  company?: string | null;
  employerEmail?: string | null;
}

// Type for the plain project object when using get({ plain: true })
interface PlainProject {
  employer?: { 
    companyName?: string; 
    email?: string;
  };
  // ...other fields
}

export class ProjectService {
  // Returns the current list of projects
  async getProjects(): Promise<ExtendedProjectModel[]> {
    try {
      const projects = await Project.findAll({
        include: [{
          model: User,
          as: 'employer',
          attributes: ['companyName']
        }]
      });
      
      return projects.map(project => {
        const plainProject = project.get({ plain: true }) as PlainProject;
        // Parse roles if it's a string
        let roles: number[] = [];
        if (typeof project.roles === 'string') {
          try {
            roles = JSON.parse(project.roles);
          } catch (e) {
            roles = [];
          }
        }
        
        return {
          idProj: project.idProj,
          name: project.name,
          description: project.description,
          salary: project.salary,
          roles: roles,
          open: project.open,
          employerId: project.employerId,
          company: plainProject.employer?.companyName || null
        };
      });
    } catch (error) {
      throw error;
    }
  }

  // Get a project by ID
  async getProjectById(idProj: number): Promise<ExtendedProjectModel | null> {
    try {
      const project = await Project.findByPk(idProj, {
        include: [{
          model: User,
          as: 'employer',
          attributes: ['companyName', 'email']
        }]
      });
      
      if (!project) {
        return null;
      }
      
      const plainProject = project.get({ plain: true }) as PlainProject;
      // Parse roles if it's a string
      let roles: number[] = [];
      if (typeof project.roles === 'string') {
        try {
          roles = JSON.parse(project.roles);
        } catch (e) {
          roles = [];
        }
      }
      
      return {
        idProj: project.idProj,
        name: project.name,
        description: project.description,
        salary: project.salary,
        roles: roles,
        open: project.open,
        employerId: project.employerId,
        company: plainProject.employer?.companyName || null,
        employerEmail: plainProject.employer?.email || null
      };
    } catch (error) {
      throw error;
    }
  }

  // Create a new project with the provided parameters
  async createProject(name: string, description: string, salary: number, roles: number[] | string, employerId: number): Promise<ProjectModel> {
    // Convert roles to a JSON string if it's not already a string
    const rolesString = typeof roles === 'string' ? roles : JSON.stringify(roles);

    // Create the project with the stringified roles
    const project = await Project.create({
      name,
      description,
      salary,
      roles: rolesString,
      open: true,
      employerId
    });

    // Get the freshly created project from the database to ensure roles are properly loaded
    const createdProject = await Project.findByPk(project.idProj);
    if (!createdProject) {
      throw new Error('Project was created but could not be retrieved');
    }

    // Parse roles for the returned model
    let parsedRoles: number[] = [];
    try {
      if (typeof createdProject.roles === 'string') {
        parsedRoles = JSON.parse(createdProject.roles);
      } else if (Array.isArray(createdProject.roles)) {
        parsedRoles = createdProject.roles;
      }
    } catch (e) {
      console.error('Error parsing roles:', e);
      parsedRoles = [];
    }

    // Return the created project with properly parsed roles
    return {
      idProj: createdProject.idProj,
      name: createdProject.name,
      description: createdProject.description,
      salary: createdProject.salary,
      roles: parsedRoles,
      open: createdProject.open,
      employerId: createdProject.employerId
    };
  }

  // Update a project with the provided parameters
  async updateProject(idProj: number, updates: Partial<ProjectModel>): Promise<ProjectModel | null> {
    const project = await Project.findByPk(idProj);
    if (!project) return null;

    // If roles is an array in updates, stringify it for database
    const dbUpdates = { ...updates } as any;
    if (updates.roles && Array.isArray(updates.roles)) {
      dbUpdates.roles = JSON.stringify(updates.roles);
    }

    await project.update(dbUpdates);

    // Parse roles for the returned model
    let roles: number[] = [];
    if (typeof project.roles === 'string') {
      try {
        roles = JSON.parse(project.roles);
      } catch (e) {
        roles = [];
      }
    }

    return {
      idProj: project.idProj,
      name: project.name,
      description: project.description,
      salary: project.salary,
      roles: roles,
      open: project.open,
      employerId: project.employerId
    };
  }

  // Delete a project by ID
  async deleteProject(idProj: number): Promise<boolean> {
    const project = await Project.findByPk(idProj);
    if (!project) return false;

    await project.destroy();
    return true;
  }

  // Add a user to a project
  async addUserToProject(idProj: number, userId: number): Promise<ProjectModel | null> {
    const project = await Project.findByPk(idProj);
    if (!project) return null;

    // Parse current roles
    let roles: number[] = [];
    if (typeof project.roles === 'string') {
      try {
        roles = JSON.parse(project.roles);
      } catch (e) {
        roles = [];
      }
    }

    if (!roles.includes(userId)) {
      roles.push(userId);
      await project.update({ roles: JSON.stringify(roles) });
    }

    return {
      idProj: project.idProj,
      name: project.name,
      description: project.description,
      salary: project.salary,
      roles: roles,
      open: project.open,
      employerId: project.employerId
    };
  }

  // Remove a user from a project
  async removeUserFromProject(
    idProj: number,
    userId: number
  ): Promise<ProjectModel | null> {
    const project = await Project.findByPk(idProj);
    if (!project) return null;

    // Parse current roles
    let roles: number[] = [];
    if (typeof project.roles === 'string') {
      try {
        roles = JSON.parse(project.roles);
      } catch (e) {
        roles = [];
      }
    }

    const updatedRoles = roles.filter(id => id !== userId);
    await project.update({ roles: JSON.stringify(updatedRoles) });

    return {
      idProj: project.idProj,
      name: project.name,
      description: project.description,
      salary: project.salary,
      roles: updatedRoles,
      open: project.open,
      employerId: project.employerId
    };
  }
}

export const projectService = new ProjectService(); 