import request from "supertest";
import { app } from "../src/start";

describe("Project API Routes", () => {
    let projectId: number;

    test("should create a new project", async () => {
        const res = await request(app).post("/api/projects/").send({
            name: "Project A",
            description: "Test project",
            salary: 60000,
            roles: [1, 2]
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("idProj");
        projectId = res.body.idProj;
    });

    test("should get all projects", async () => {
        const res = await request(app).get("/api/projects/");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test("should get a project by ID", async () => {
        const res = await request(app).get(`/api/projects/${projectId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.idProj).toBe(projectId);
    });

    test("should return 404 for non-existent project", async () => {
        const res = await request(app).get("/api/projects/9999");
        expect(res.statusCode).toBe(404);
    });

    test("should update a project", async () => {
        const res = await request(app).patch(`/api/projects/${projectId}`).send({
            name: "Updated Project Name"
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("Updated Project Name");
    });

    test("should return 404 when updating non-existent project", async () => {
        const res = await request(app).patch("/api/projects/9999").send({ name: "Non-existent" });
        expect(res.statusCode).toBe(400);
    });

    test("should delete a project", async () => {
        const res = await request(app).delete(`/api/projects/${projectId}`);
        expect(res.statusCode).toBe(200);
    });

    test("should return 404 when deleting non-existent project", async () => {
        const res = await request(app).delete("/api/projects/9999");
        expect(res.statusCode).toBe(404);
    });
});
