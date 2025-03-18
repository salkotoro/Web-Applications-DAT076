import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';

import Homepage from "../Homepage";
import { BrowserRouter } from "react-router-dom";

describe("Homepage Component", () => {
  test("renders the homepage title", () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );
    expect(screen.getByText("Project Employment Hub")).toBeInTheDocument();
  });

  test("shows loading message before projects load", () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );
    expect(screen.getByText("Loading projects...")).toBeInTheDocument();
  });

  test("renders a list of projects", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            { idProj: 1, name: "Project A", description: "Test project", salary: 50000, roles: [], open: true }
          ])
      })
    ) as jest.Mock;

    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    expect(await screen.findByText("Project A")).toBeInTheDocument();
  });
});
