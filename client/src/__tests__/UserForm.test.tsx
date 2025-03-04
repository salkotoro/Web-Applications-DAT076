import { render, screen, fireEvent } from "@testing-library/react";
import UserForm from "../UserForm";

describe("UserForm Component", () => {
  // Unit tests
  test("renders all form fields", () => {
    render(<UserForm />);

    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  test("renders submit button", () => {
    render(<UserForm />);
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  // Integration tests
  test("updates form state when typing", () => {
    render(<UserForm />);

    const firstNameInput = screen.getByLabelText("First Name");
    fireEvent.change(firstNameInput, { target: { value: "John" } });

    expect(firstNameInput).toHaveValue("John");
  });

  test("submits form with correct data", () => {
    const consoleSpy = jest.spyOn(console, "log");
    render(<UserForm />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    });

    // Submit the form
    fireEvent.submit(screen.getByRole("form", { name: "user-form" }));

    // Check if console.log was called with the correct data
    expect(consoleSpy).toHaveBeenCalledWith({
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "john@example.com",
    });

    consoleSpy.mockRestore();
  });

  test("initializes with empty form fields", () => {
    render(<UserForm />);

    expect(screen.getByLabelText("First Name")).toHaveValue("");
    expect(screen.getByLabelText("Last Name")).toHaveValue("");
    expect(screen.getByLabelText("Username")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("");
  });
});
