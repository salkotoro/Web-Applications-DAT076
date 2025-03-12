import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "../src/components/Register";
import * as authHook from "../src/context/useAuth";

// Spy on the useAuth hook
const mockUseAuth = jest.spyOn(authHook, 'useAuth');

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe("Register Component", () => {
  // Setup mock for auth methods
  const mockRegisterEmployee = jest.fn();
  const mockRegisterEmployer = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      registerEmployee: mockRegisterEmployee,
      registerEmployer: mockRegisterEmployer
    } as any);
    
    jest.clearAllMocks();
  });

  // Unit tests
  test("renders registration form with all fields", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  test("renders account type options", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Employee/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employer/i)).toBeInTheDocument();
  });

  test("shows company name field when 'Employer' is selected", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Initially, company name shouldn't be visible for Employee
    expect(screen.queryByLabelText(/Company Name/i)).not.toBeInTheDocument();
    
    // Select Employer account type
    const employerRadio = screen.getByLabelText(/Employer/i);
    fireEvent.click(employerRadio);
    
    // Now company name should be visible
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
  });

  // Integration tests
  test("updates form state when typing", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    expect(usernameInput).toHaveValue("testuser");
    
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput).toHaveValue("test@example.com");
  });

  test("validates form and shows error messages", async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    // Submit the form without filling in any fields
    const form = document.querySelector('form');
    fireEvent.submit(form!);
    
    // Check that validation errors were shown
    // Note: We don't check for specific classes or messages since the behavior
    // may vary depending on implementation details of the component
    expect(screen.getByText(/Username must be at least/i)).toBeInTheDocument();
  });

  test("calls registerEmployee when submitting as employee", async () => {
    mockRegisterEmployee.mockResolvedValueOnce(undefined);
    
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "User" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@example.com" } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    
    // Wait for form submission to complete
    await waitFor(() => {
      expect(mockRegisterEmployee).toHaveBeenCalledWith({
        username: "testuser",
        password: "Password123!",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com"
      });
    });
  });

  test("calls registerEmployer when submitting as employer", async () => {
    mockRegisterEmployer.mockResolvedValueOnce(undefined);
    
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Select Employer account type
    fireEvent.click(screen.getByLabelText(/Employer/i));
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "testcompany" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "john@company.com" } });
    fireEvent.change(screen.getByLabelText(/Company Name/i), { target: { value: "Test Company" } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    
    // Wait for form submission to complete
    await waitFor(() => {
      expect(mockRegisterEmployer).toHaveBeenCalled();
      // Check that company name was included
      expect(mockRegisterEmployer.mock.calls[0][0]).toHaveProperty("companyName", "Test Company");
    });
  });
}); 