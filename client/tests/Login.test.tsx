import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Login } from "../src/components/Login";
import { BrowserRouter } from "react-router-dom";
import * as authHook from "../src/context/useAuth";

// Spy on the useAuth hook
const mockUseAuth = jest.spyOn(authHook, 'useAuth');

describe("Login Component", () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ login: mockLogin } as any);
    mockLogin.mockClear();
  });

  // Unit tests
  test("renders login form with all fields", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("renders registration link", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/register here/i)).toBeInTheDocument();
  });

  // Integration tests
  test("updates form state when typing", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(usernameInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("password123");
  });

  test("calls login function and navigates on successful submit", async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.submit(screen.getByRole("button", { name: /login/i }));

    // Check if login was called with correct data
    expect(mockLogin).toHaveBeenCalledWith("testuser", "password123");
  });

  test("displays error message on login failure", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpassword" },
    });

    // Submit the form
    fireEvent.submit(screen.getByRole("button", { name: /login/i }));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials");
    });
  });

  test("initializes with empty form fields", () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByLabelText("Username")).toHaveValue("");
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });
}); 