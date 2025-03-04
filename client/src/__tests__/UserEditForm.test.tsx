import { render, screen, fireEvent } from "@testing-library/react";
import UserEditForm from "../UserEditForm";

const mockUser = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  email: "john@example.com",
};

describe("UserEditForm Component", () => {
  const mockOnSave = jest.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  // Unit tests
  test("renders with user data", () => {
    render(<UserEditForm userData={mockUser} onSave={mockOnSave} />);

    expect(screen.getByLabelText("First Name")).toHaveValue("John");
    expect(screen.getByLabelText("Last Name")).toHaveValue("Doe");
    expect(screen.getByLabelText("Username")).toHaveValue("johndoe");
    expect(screen.getByLabelText("Email")).toHaveValue("john@example.com");
  });

  test("renders save button", () => {
    render(<UserEditForm userData={mockUser} onSave={mockOnSave} />);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  // Integration tests
  test("updates form fields when typing", () => {
    render(<UserEditForm userData={mockUser} onSave={mockOnSave} />);

    const firstNameInput = screen.getByLabelText("First Name");
    fireEvent.change(firstNameInput, { target: { value: "Jane" } });

    expect(firstNameInput).toHaveValue("Jane");
  });

  test("calls onSave with updated user data when form is submitted", () => {
    render(<UserEditForm userData={mockUser} onSave={mockOnSave} />);

    const firstNameInput = screen.getByLabelText("First Name");
    fireEvent.change(firstNameInput, { target: { value: "Jane" } });

    const form = screen.getByRole("form", { name: "edit-user-form" });
    fireEvent.submit(form);

    expect(mockOnSave).toHaveBeenCalledWith({
      ...mockUser,
      firstName: "Jane",
    });
  });
});
