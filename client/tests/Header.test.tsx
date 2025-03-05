import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Header } from "../src/components/Header";
import { AuthContext } from "../src/context/AuthContext";

const mockUser = {
  id: 1,
  username: "testuser",
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
};

const renderWithAuth = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider
        value={{
          user: mockUser,
          login: jest.fn(),
          logout: jest.fn(),
          register: jest.fn(),
        }}
      >
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe("Header Component", () => {
  test("renders header with user name", () => {
    renderWithAuth(<Header />);
    expect(screen.getByText("Project Manager")).toBeInTheDocument();
  });

  test("search form works", () => {
    renderWithAuth(<Header />);
    const searchInput = screen.getByPlaceholderText("Search projects...");
    fireEvent.change(searchInput, { target: { value: "test project" } });
    expect(searchInput).toHaveValue("test project");
  });

  test("dropdown shows user menu", () => {
    renderWithAuth(<Header />);
    const userButton = screen.getByText(/Test User/);
    fireEvent.click(userButton);
    expect(screen.getByText("Edit Profile")).toBeInTheDocument();
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });
});
