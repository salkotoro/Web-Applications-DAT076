import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let sequelize: Sequelize;

// Use SQLite in-memory database for tests, PostgreSQL for development/production
if (process.env.NODE_ENV === 'test') {
  console.log('Using SQLite in-memory database for testing');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false // Disable logging for tests
  });
} else {
  console.log('Using PostgreSQL database');
  sequelize = new Sequelize('postgres://app_db_user:postgres@localhost:5432', {
    logging: process.env.NODE_ENV === 'development' // Only log in development mode
  });
}

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(`Connection has been established successfully to ${process.env.NODE_ENV === 'test' ? 'SQLite' : 'PostgreSQL'}.`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Only test connection if not in test environment
if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

export { sequelize };
