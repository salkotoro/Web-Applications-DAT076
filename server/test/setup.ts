// Set NODE_ENV to 'test' to use SQLite
process.env.NODE_ENV = 'test';

import { sequelize } from '../db/conn';
import { app } from "../src/start";
const session = require("supertest-session");

// Initialize test models
import { User } from '../db/user.db';
import { Project, ProjectEmployee } from '../db/project.db';

// Sync the database before all tests
beforeAll(async () => {
  try {
    // Force sync to create fresh tables
    await sequelize.sync({ force: true });
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Error synchronizing database:", error);
    throw error;
  }
});

// Cleanup after each test
afterEach(async () => {
  try {
    // Clean up test data in reverse order to respect foreign key constraints
    await ProjectEmployee.destroy({ where: {}, force: true });
    await Project.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  } catch (error) {
    console.error("Error cleaning up test data:", error);
  }
});

// Close connection after all tests
afterAll(async () => {
  try {
    await sequelize.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
});

export const testSession = session(app);
