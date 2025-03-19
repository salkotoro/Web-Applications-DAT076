import { projectService } from "../src/services/projectService";
import { sequelize } from "../db/conn";
import { Project } from "../db/project.db";
import { User } from "../db/user.db";
import { UserType } from "../src/models/User";

// This is for integration testing with a real database
// NOTE: This will modify your database, so be careful when running it

// This test uses SQLite in-memory database

describe("ProjectService Integration Tests", () => {
  const testProject = {
    name: "Integration Test Project",
    description: "This is an integration test project",
    salary: 1500,
    roles: [1, 2],
    open: true,
    employerId: 1,
    projectId: 1
  };

  const testUser = {
    username: "employer_test",
    password: "password",
    firstName: "Test",
    lastName: "Employer",
    email: "employer@test.com",
    userType: UserType.EMPLOYER,
    companyName: "Test Company"
  };

  // Initialize projectId with a dummy value to avoid TypeScript errors
  let projectId: number = 1;

  // Set up and clean database before all tests
  beforeAll(async () => {
    // Make sure the database is properly synced
    await sequelize.sync({ force: true });
    await User.create(testUser);
    const employer = await User.findOne({ where: { username: testUser.username } });
    if (!employer) throw new Error("Employer not found");
    testProject.employerId = employer.id; 
    testProject.projectId = employer.id;
    await Project.create(testProject as any);
    projectId = employer.id;
  });

  // Clean up the database after all tests
  afterAll(async () => {
    // Clean up data and close connection
    await Project.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await sequelize.close();
  });

  // Skip these tests for now, until we can fix the integration test setup
  test("should connect to database and create a new project", async () => {
    // Create a new project directly using the service
    const newProject = {
      name: "New Service Project",
      description: "Created through service",
      salary: 2000,
      roles: [1, 2],
      employerId: testProject.employerId,
      projectId: testProject.projectId
    };
    
    const result = await projectService.createProject(
      newProject.name,
      newProject.description,
      newProject.salary,
      newProject.roles,
      testProject.employerId
    );

    // Verify project was created with correct properties
    expect(result).not.toBeNull();
    expect(result.name).toBe(newProject.name);
    expect(result.description).toBe(newProject.description);
    expect(result.salary).toBe(newProject.salary);
    expect(result.roles).toEqual(newProject.roles);
  });

  test("should get all projects", async () => {
    const projects = await projectService.getProjects();
    
    expect(projects.length).toBeGreaterThan(0);
    expect(projects.some(p => p.name === testProject.name)).toBe(true);
  });

  test("should get project by id", async () => {
    const project = await projectService.getProjectById(projectId);
    
    expect(project).not.toBeNull();
    expect(project?.name).toBe(testProject.name);
    expect(project?.description).toBe(testProject.description);
  });

  test("should update project information", async () => {
    // Update the project
    const updates = { 
      name: "Updated Project", 
      description: "Updated description" 
    };
    
    const result = await projectService.updateProject(projectId, updates);

    // Verify update was successful
    expect(result?.name).toBe(updates.name);
    expect(result?.description).toBe(updates.description);

    // Verify database was updated
    const updatedProject = await Project.findByPk(projectId);
    expect(updatedProject?.name).toBe(updates.name);
    expect(updatedProject?.description).toBe(updates.description);
  });

  test("should delete project", async () => {
    // Delete the project
    const result = await projectService.deleteProject(projectId);
    expect(result).toBe(true);

    // Verify project was deleted
    const deletedProject = await Project.findByPk(projectId);
    expect(deletedProject).toBeNull();
  });
}); 