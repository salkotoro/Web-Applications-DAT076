import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "../src/components/Header";
import * as authHook from "../src/context/useAuth";

// Spy on the useAuth hook
const mockUseAuth = jest.spyOn(authHook, 'useAuth');

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' })
}));

describe("Header Component", () => {
  // Setup mock for useAuth methods
  const mockIsAuthenticated = jest.fn();
  const mockIsEmployer = jest.fn();
  const mockIsEmployee = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
      isAuthenticated: mockIsAuthenticated,
      isEmployer: mockIsEmployer,
      isEmployee: mockIsEmployee
    } as any);
    
    mockIsAuthenticated.mockReturnValue(false);
    mockIsEmployer.mockReturnValue(false);
    mockIsEmployee.mockReturnValue(false);
    
    jest.clearAllMocks();
  });

  // Unit tests
  test("renders logo", () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText("Project Hub")).toBeInTheDocument();
  });

  test("shows login and register buttons when not authenticated", () => {
    mockIsAuthenticated.mockReturnValue(false);
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // First click the profile button to open the dropdown
    const profileButton = screen.getByRole('button', { name: '' });
    fireEvent.click(profileButton);

    // Now check for the login and register buttons in the dropdown
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Quick Register")).toBeInTheDocument();
  });

  test("shows user dropdown when authenticated", () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockUseAuth.mockReturnValue({
      user: { username: "testuser", firstName: "Test", lastName: "User" },
      logout: mockLogout,
      isAuthenticated: mockIsAuthenticated,
      isEmployer: mockIsEmployer,
      isEmployee: mockIsEmployee
    } as any);
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Open the dropdown first
    const profileButton = screen.getByRole('button', { name: '' });
    fireEvent.click(profileButton);

    // Now check that the user info is in the dropdown
    const userFullName = screen.getByText("Test User");
    expect(userFullName).toBeInTheDocument();
  });

  test("shows employer-specific links when user is an employer", () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockIsEmployer.mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText(/My Projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Applicants/i)).toBeInTheDocument();
  });

  test("shows employee-specific links when user is an employee", () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockIsEmployee.mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText(/My Applications/i)).toBeInTheDocument();
  });

  // Integration tests
  test("calls logout function when logout button is clicked", () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockUseAuth.mockReturnValue({
      user: { username: "testuser", firstName: "Test", lastName: "User" },
      logout: mockLogout,
      isAuthenticated: mockIsAuthenticated,
      isEmployer: mockIsEmployer,
      isEmployee: mockIsEmployee
    } as any);
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    // Open the user dropdown
    const profileButton = screen.getByRole('button', { name: '' });
    fireEvent.click(profileButton);
    
    // Click the logout button
    const logoutButton = screen.getByText(/Sign Out/i);
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });
}); 