import { app } from "../src/start";
const session = require("supertest-session");

export const testSession = session(app);
