import express, { RequestHandler } from 'express';
import { Project, ProjectEmployee } from "../../db/project.db";
import { User } from "../../db/user.db";
import { UserType } from "../models/User";
import { projectService } from "../services/projectService";
import { authMiddleware } from "../middleware/authMiddleware";

// Type for the plain project object when using get({ plain: true })
interface PlainProject {
  employer?: { 
    companyName?: string; 
    email?: string;
  };
  idProj: number;
  name: string;
  description: string;
  salary: number;
  roles: string;
  open: boolean;
  employerId: number;
}

// Type for the plain project employee data
interface PlainProjectEmployee {
  Project?: PlainProject;
  User?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  id: number;
  projectId: number;
  employeeId: number;
  joinedAt: Date;
  status: string;
}

export const projectRouter = express.Router();

// Get all projects
projectRouter.get("/", (async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [{
        model: User,
        as: 'employer',
        attributes: ['companyName']
      }]
    });
    
    const formattedProjects = projects.map(project => {
      const plainProject = project.get({ plain: true }) as PlainProject;
      return {
        ...plainProject,
        company: plainProject.employer?.companyName || null
      };
    });
    
    res.json(formattedProjects);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
}) as RequestHandler);

// Get projects created by the logged-in employer
projectRouter.get("/employer", authMiddleware, (async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Check if the user is an employer
    const user = await User.findByPk(req.session.userId);
    if (!user || user.userType !== UserType.EMPLOYER) {
      return res.status(403).json({ message: "Only employers can view their projects" });
    }

    // Find all projects created by this employer
    const projects = await Project.findAll({
      where: { employerId: req.session.userId }
    });

    res.json(projects);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
}) as RequestHandler);

// Get project by ID
projectRouter.get("/:id", (async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const project = await Project.findByPk(id, {
      include: [{
        model: User,
        as: 'employer',
        attributes: ['companyName', 'email']
      }]
    });
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    const plainProject = project.get({ plain: true }) as PlainProject;
    const formattedProject = {
      ...plainProject,
      company: plainProject.employer?.companyName || null,
      employerEmail: plainProject.employer?.email || null
    };
    
    res.json(formattedProject);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
}) as RequestHandler);

// Create a new project
projectRouter.post("/", authMiddleware, (async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify the user is an employer
    const user = await User.findByPk(req.session.userId);
    if (!user || user.userType !== UserType.EMPLOYER) {
      return res.status(403).json({ message: "Only employers can create projects" });
    }

    const { name, description, salary, roles } = req.body;

    // Create the project and set the employerId
    const newProject = await Project.create({
      name,
      description,
      salary,
      roles,
      open: true,
      employerId: req.session.userId
    });

    res.status(201).json(newProject);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
}) as RequestHandler);

// Update a project
projectRouter.put("/:id", authMiddleware, (async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const projectId = parseInt(req.params.id);
    
    // Get the project to verify ownership
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if the user owns this project
    if (project.employerId !== req.session.userId) {
      return res.status(403).json({ message: "You don't have permission to update this project" });
    }
    
    const updatedProject = await projectService.updateProject(projectId, req.body);
    res.json(updatedProject);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
}) as RequestHandler);

// Delete a project
projectRouter.delete("/:id", authMiddleware, (async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const projectId = parseInt(req.params.id);
    
    // Get the project to verify ownership
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if the user owns this project
    if (project.employerId !== req.session.userId) {
      return res.status(403).json({ message: "You don't have permission to delete this project" });
    }
    
    await projectService.deleteProject(projectId);
    res.status(204).end();
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
}) as RequestHandler);

// Apply to a project (employee)
projectRouter.post("/:id/apply", authMiddleware, (async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const projectId = parseInt(req.params.id);
    const employeeId = req.session.userId;
    
    // Verify the user is an employee
    const user = await User.findByPk(employeeId);
    if (!user || user.userType !== UserType.EMPLOYEE) {
      return res.status(403).json({ message: "Only employees can apply to projects" });
    }
    
    // Check if the project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if the project is open
    if (!project.open) {
      return res.status(400).json({ message: "This project is not accepting applications" });
    }
    
    // Check if the employee has already applied
    const existingApplication = await ProjectEmployee.findOne({
      where: { projectId, employeeId }
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied to this project" });
    }
    
    // Create the application
    await ProjectEmployee.create({
      projectId,
      employeeId,
      joinedAt: new Date(),
      status: 'pending'
    });
    
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
}) as RequestHandler);

// Get all employees for a project (employer only)
projectRouter.get("/:id/employees", authMiddleware, (async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const projectId = parseInt(req.params.id);
    
    // Get the project to verify ownership
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if the user owns this project
    if (project.employerId !== req.session.userId) {
      return res.status(403).json({ message: "You don't have permission to view this project's employees" });
    }
    
    // Get all employees for this project
    const projectEmployees = await ProjectEmployee.findAll({
      where: { projectId },
      include: [{
        model: User,
        attributes: ['id', 'username', 'firstName', 'lastName', 'email']
      }]
    });
    
    res.json(projectEmployees);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
}) as RequestHandler);

// Check if a user has already applied to a project
projectRouter.get("/:id/application-status", authMiddleware, (async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const projectId = parseInt(req.params.id);
    const employeeId = req.session.userId;
    
    // Check if the project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if the employee has already applied
    const existingApplication = await ProjectEmployee.findOne({
      where: { projectId, employeeId }
    });
    
    res.json({ hasApplied: !!existingApplication });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
}) as RequestHandler);

// Get all applications for the current employee
projectRouter.get("/applications/my", authMiddleware, (async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const employeeId = req.session.userId;
    
    // Verify the user is an employee
    const user = await User.findByPk(employeeId);
    if (!user || user.userType !== UserType.EMPLOYEE) {
      return res.status(403).json({ message: "Only employees can view their applications" });
    }
    
    // Get all project applications for this employee
    const applications = await ProjectEmployee.findAll({
      where: { employeeId },
      include: [{
        model: Project,
        include: [{
          model: User,
          as: 'employer',
          attributes: ['companyName', 'email']
        }]
      }]
    });
    
    // Format the response
    const formattedApplications = applications.map(app => {
      const plainApp = app.get({ plain: true }) as PlainProjectEmployee;
      const project = plainApp.Project || {
        idProj: 0,
        name: '',
        description: '',
        salary: 0,
        roles: '[]',
        open: false,
        employerId: 0,
        employer: { companyName: 'Unknown Company', email: '' }
      };
      const employee = plainApp.User || {
        id: 0,
        firstName: '',
        lastName: '',
        email: ''
      };
      
      // Parse roles from string if needed
      let role = 'General';
      if (typeof project.roles === 'string') {
        try {
          const roles = JSON.parse(project.roles);
          role = Array.isArray(roles) && roles.length > 0 ? roles[0] : 'General';
        } catch (e) {
          role = project.roles || 'General';
        }
      }
      
      return {
        projectId: project.idProj,
        projectName: project.name,
        companyName: project.employer?.companyName || 'Unknown Company',
        role: role,
        salary: project.salary,
        appliedDate: app.joinedAt,
        status: app.status || 'pending', // Use the actual status from the database
        employerEmail: project.employer?.email
      };
    });
    
    res.json(formattedApplications);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
}) as RequestHandler);

// Get all applicants across all projects for an employer
projectRouter.get("/applicants/all", authMiddleware, (async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const employerId = req.session.userId;
    
    // Verify the user is an employer
    const user = await User.findByPk(employerId);
    if (!user || user.userType !== UserType.EMPLOYER) {
      return res.status(403).json({ message: "Only employers can view applicants" });
    }
    
    // Get all projects created by this employer
    const projects = await Project.findAll({
      where: { employerId },
      attributes: ['idProj', 'name', 'roles']
    });
    
    const projectIds = projects.map(project => project.idProj);
    
    // Get all applications for all projects of this employer
    const applications = await ProjectEmployee.findAll({
      where: { 
        projectId: projectIds 
      },
      include: [
        {
          model: Project,
          attributes: ['idProj', 'name', 'roles']
        },
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });
    
    // Format the response
    const formattedApplications = applications.map(app => {
      const plainApp = app.get({ plain: true }) as PlainProjectEmployee;
      const project = plainApp.Project || {
        idProj: 0,
        name: '',
        description: '',
        salary: 0,
        roles: '[]',
        open: false,
        employerId: 0,
        employer: { companyName: 'Unknown Company', email: '' }
      };
      const employee = plainApp.User || {
        id: 0,
        firstName: '',
        lastName: '',
        email: ''
      };
      
      // Parse roles from string if needed
      let role = 'General';
      if (typeof project.roles === 'string') {
        try {
          const roles = JSON.parse(project.roles);
          role = Array.isArray(roles) && roles.length > 0 ? roles[0] : 'General';
        } catch (e) {
          role = project.roles || 'General';
        }
      }
      
      return {
        applicationId: app.id,
        projectId: project.idProj,
        projectName: project.name,
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeEmail: employee.email,
        role: role,
        appliedDate: app.joinedAt,
        status: app.status || 'pending'
      };
    });
    
    res.json(formattedApplications);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
}) as RequestHandler);

// Update application status (accept/reject)
projectRouter.put("/applications/:id/status", authMiddleware, (async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const applicationId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    
    const employerId = req.session.userId;
    
    // Verify the user is an employer
    const user = await User.findByPk(employerId);
    if (!user || user.userType !== UserType.EMPLOYER) {
      return res.status(403).json({ message: "Only employers can update application status" });
    }
    
    // Get the application
    const application = await ProjectEmployee.findByPk(applicationId, {
      include: [{ model: Project }]
    });
    
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    // Verify the employer owns the project
    const applicationProject = application.Project;
    if (!applicationProject || applicationProject.employerId !== employerId) {
      return res.status(403).json({ message: "You don't have permission to update this application" });
    }
    
    // Update the application status
    application.status = status;
    await application.save();
    
    res.json({ message: `Application ${status} successfully` });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
}) as RequestHandler); 