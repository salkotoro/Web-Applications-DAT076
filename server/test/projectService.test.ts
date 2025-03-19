import { projectService } from "../src/services/projectService";
import { Project } from "../db/project.db";

// Mock the Project model
jest.mock("../db/project.db", () => {
  // Create a mock project with roles as a JSON string (as it would be in the database)
  const mockProject = {
    idProj: 1,
    name: "Test Project",
    description: "This is a test",
    salary: 1500,
    roles: JSON.stringify(["Frontend", "Backend"]), // Stored as string in DB
    open: true,
    employerId: 1,
    // Mock the get method to return a plain project object with employer relationship
    get: jest.fn((options) => {
      if (options && options.plain) {
        return {
          idProj: 1,
          name: "Test Project",
          description: "This is a test",
          salary: 1500,
          roles: JSON.stringify(["Frontend", "Backend"]),
          open: true,
          employerId: 1,
          employer: {
            companyName: "Test Company",
            email: "test@company.com"
          }
        };
      }
      return this;
    }),
    update: jest.fn().mockImplementation(updates => {
      // Actually apply the updates to the mockProject
      Object.assign(mockProject, updates);
      // Return the updated object
      return Promise.resolve(mockProject);
    }),
    destroy: jest.fn().mockResolvedValue(true),
  };

  return {
    Project: {
      findAll: jest.fn().mockImplementation(() => Promise.resolve([mockProject])),
      findByPk: jest.fn().mockImplementation(() => Promise.resolve(mockProject)),
      create: jest.fn().mockImplementation((projectData) => 
        Promise.resolve({
          idProj: 1,
          ...projectData,
          // Copy the passed properties to the mock project
          roles: projectData.roles, // Preserve the roles as passed
          get: jest.fn((options) => {
            if (options && options.plain) {
              return {
                idProj: 1,
                ...projectData,
                employer: {
                  companyName: "Test Company",
                  email: "test@company.com"
                }
              };
            }
            return this;
          }),
          update: jest.fn().mockImplementation(updates => {
            return Promise.resolve({ idProj: 1, ...projectData, ...updates });
          }),
          destroy: jest.fn().mockResolvedValue(true),
        })
      ),
    },
  };
});

describe("ProjectService", () => {
  // Define base mockProjectData outside beforeEach
  let mockProjectData: any = null;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create a fresh mockProjectData for each test
    mockProjectData = {
      idProj: 1,
      name: "Test Project",
      description: "This is a test",
      salary: 1500,
      roles: JSON.stringify(["Frontend", "Backend"]), // String representation in DB
      open: true,
      employerId: 1,
      get: jest.fn((options) => {
        if (options && options.plain) {
          return {
            idProj: 1,
            name: "Test Project",
            description: "This is a test",
            salary: 1500,
            roles: JSON.stringify(["Frontend", "Backend"]),
            open: true,
            employerId: 1,
            employer: {
              companyName: "Test Company",
              email: "test@company.com"
            }
          };
        }
        return this;
      }),
      update: jest.fn().mockImplementation(updates => {
        // Apply updates to mockProjectData
        Object.keys(updates).forEach(key => {
          mockProjectData[key] = updates[key];
        });
        return Promise.resolve(mockProjectData);
      }),
      destroy: jest.fn().mockResolvedValue(true)
    };
    
    // Default mock implementations
    (Project.findAll as jest.Mock).mockResolvedValue([mockProjectData]);
    (Project.findByPk as jest.Mock).mockResolvedValue(mockProjectData);
  });

  test("should get all projects with company name", async () => {
    const result = await projectService.getProjects();
    
    // Test that findAll was called with the expected include
    expect(Project.findAll).toHaveBeenCalledWith({
      include: [{
        model: expect.anything(),
        as: 'employer',
        attributes: ['companyName']
      }]
    });
    
    // Verify the result
    expect(result).toHaveLength(1);
    expect(result[0].idProj).toBe(1);
    expect(result[0].name).toBe(mockProjectData.name);
    
    // Specifically verify the roles have been parsed correctly (string → array)
    expect(Array.isArray(result[0].roles)).toBe(true);
    expect(result[0].roles).toEqual(["Frontend", "Backend"]);
    
    // Verify company name was included
    expect(result[0].company).toBe("Test Company");
  });

  test("should get project by id with employer details", async () => {
    const result = await projectService.getProjectById(1);
    
    // Test correct parameters
    expect(Project.findByPk).toHaveBeenCalledWith(1, {
      include: [{
        model: expect.anything(),
        as: 'employer',
        attributes: ['companyName', 'email']
      }]
    });
    
    // Verify the result
    expect(result).not.toBeNull();
    expect(result?.idProj).toBe(1);
    expect(result?.name).toBe(mockProjectData.name);
    
    // Check roles were parsed correctly
    expect(Array.isArray(result?.roles)).toBe(true);
    
    // Verify employer details
    expect(result?.company).toBe("Test Company");
    expect(result?.employerEmail).toBe("test@company.com");
  });

  test("should create a new project and parse roles correctly", async () => {
    // Test with array input for roles
    const rolesArray = [1, 2]; // Use numbers instead of strings for roles
    
    // Mock Project.findByPk to return a project with the new name
    (Project.findByPk as jest.Mock).mockResolvedValueOnce({
      idProj: 1,
      name: "New Project",
      description: "New Description",
      salary: 2000,
      roles: JSON.stringify(rolesArray),
      open: true,
      employerId: 1,
      get: jest.fn((options) => {
        if (options && options.plain) {
          return {
            idProj: 1,
            name: "New Project", 
            description: "New Description",
            salary: 2000,
            roles: JSON.stringify(rolesArray),
            open: true,
            employerId: 1,
            employer: {
              companyName: "Test Company",
              email: "test@company.com"
            }
          };
        }
        return this;
      })
    });
    
    const result = await projectService.createProject(
      "New Project",
      "New Description",
      2000,
      rolesArray, // Pass as array, should be stringified for DB
      1
    );
    
    // Verify correct parameters to database
    expect(Project.create).toHaveBeenCalledWith({
      name: "New Project",
      description: "New Description",
      salary: 2000,
      roles: JSON.stringify(rolesArray), // Should be stringified for DB
      open: true,
      employerId: 1
    });
    
    // Verify the result
    expect(result).toHaveProperty("idProj", 1);
    expect(result.name).toBe("New Project");
    
    // Verify roles is an array in the result
    expect(Array.isArray(result.roles)).toBe(true);
    expect(result.roles).toEqual(rolesArray); // Should match the input roles array
  });

  test("should update a project and handle roles conversion", async () => {
    // Test with roles as an array in the updates
    const updates = {
      name: "Updated Name",
      description: "Updated Description",
      roles: [3, 4, 5] // Use numbers instead of strings for roles
    };
    
    const result = await projectService.updateProject(1, updates);
    
    // Verify project fetched correctly
    expect(Project.findByPk).toHaveBeenCalledWith(1);
    
    // Verify the updates passed to database were properly formatted
    // The update call should have stringified the roles
    expect(mockProjectData.update).toHaveBeenCalled();
    
    // Verify the result
    expect(result).not.toBeNull();
    expect(result?.idProj).toBe(1);
    expect(result?.name).toBe("Updated Name");
    
    // Verify roles is an array in the result
    expect(Array.isArray(result?.roles)).toBe(true);
  });

  test("should delete a project", async () => {
    const result = await projectService.deleteProject(1);
    
    expect(Project.findByPk).toHaveBeenCalledWith(1);
    expect(mockProjectData.destroy).toHaveBeenCalled();
    expect(result).toBe(true);
  });
  
  // Test the addUserToProject method
  test("should add a user to a project's roles", async () => {
    const userId = 2; // User to add
    
    const result = await projectService.addUserToProject(1, userId);
    
    // Verify project was fetched
    expect(Project.findByPk).toHaveBeenCalledWith(1);
    
    // Verify the result
    expect(result).not.toBeNull();
    expect(Array.isArray(result?.roles)).toBe(true);
    expect(result?.roles).toContain(userId); // Should include the new user ID
  });
  
  // Test the removeUserFromProject method
  test("should remove a user from a project's roles", async () => {
    const userId = 5; // Some user ID to remove
    
    // We need to set up the mock for this specific test
    // to return an array with the user we want to remove
    const projectWithUser = {
      ...mockProjectData,
      roles: JSON.stringify([2, 5, 8]), // Include userId 5
      get: jest.fn(() => ({
        idProj: 1,
        name: "Test Project",
        roles: JSON.stringify([2, 5, 8]),
        employer: { companyName: "Test" }
      }))
    };
    (Project.findByPk as jest.Mock).mockResolvedValueOnce(projectWithUser);
    
    const result = await projectService.removeUserFromProject(1, userId);
    
    // Verify project was fetched
    expect(Project.findByPk).toHaveBeenCalledWith(1);
    
    // Verify the result
    expect(result).not.toBeNull();
    expect(Array.isArray(result?.roles)).toBe(true);
    expect(result?.roles).not.toContain(userId); // Should not include the removed user
  });
}); 