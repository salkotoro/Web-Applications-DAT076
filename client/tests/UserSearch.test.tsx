import { render, screen, fireEvent } from "@testing-library/react";
import UserSearch from "../src/UserSearch";

describe("UserSearch Component", () => {
  // Unit tests
  test("renders search input", () => {
    render(<UserSearch />);
    const searchInput = screen.getByPlaceholderText("Search for a user...");
    expect(searchInput).toBeInTheDocument();
  });

  test("initially shows no results", () => {
    render(<UserSearch />);
    const userList = screen.queryByRole("list");
    expect(userList).not.toBeInTheDocument();
  });

  // Integration tests
  test("shows filtered results when typing", () => {
    render(<UserSearch />);
    const searchInput = screen.getByPlaceholderText("Search for a user...");

    fireEvent.change(searchInput, { target: { value: "john" } });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });

  test("shows multiple results for partial matches", () => {
    render(<UserSearch />);
    const searchInput = screen.getByPlaceholderText("Search for a user...");

    fireEvent.change(searchInput, { target: { value: "j" } });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  test("clears results when search input is empty", () => {
    render(<UserSearch />);
    const searchInput = screen.getByPlaceholderText("Search for a user...");

    // First search for something
    fireEvent.change(searchInput, { target: { value: "john" } });
    expect(screen.getByText("John Doe")).toBeInTheDocument();

    // Clear the input
    fireEvent.change(searchInput, { target: { value: "" } });
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
