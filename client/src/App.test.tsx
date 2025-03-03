import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

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
