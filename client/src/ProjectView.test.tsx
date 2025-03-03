import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProjectView from "./ProjectView";

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        idProj: 1,
        name: "Project A",
        description: "Test project",
        salary: 50000,
        roles: ["Alice", "Bob"],
        open: true
      })
  })
) as jest.Mock;

describe("ProjectView Component", () => {
  test("renders project details", async () => {
    render(
      <MemoryRouter initialEntries={["/projects/1"]}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Project A")).toBeInTheDocument();
    expect(screen.getByText("Test project")).toBeInTheDocument();
    expect(screen.getByText("$50000")).toBeInTheDocument();
  });

  test("displays error when project not found", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Project not found"))) as jest.Mock;

    render(
      <MemoryRouter initialEntries={["/projects/999"]}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectView />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Project not found")).toBeInTheDocument();
  });
});
