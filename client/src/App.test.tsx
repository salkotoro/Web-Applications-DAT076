import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          idProj: 1,
          name: "Project A",
          description: "Test project",
          salary: 50000,
          roles: ["Alice", "Bob"],
          open: true,
        }),
    })
  ) as jest.Mock;
});

describe("App Navigation", () => {
  test("renders homepage and navigates to project details", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Project Employment Hub")).toBeInTheDocument();
  });

  test("navigates to project view when clicking on a project", async () => {
    render(
      <MemoryRouter initialEntries={["/projects/1"]}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText("Project A")).toBeInTheDocument();
  });
});
