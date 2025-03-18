import { render, screen, fireEvent } from "@testing-library/react";
import UserSearch from "../UserSearch";
import '@testing-library/jest-dom';


describe("UserSearch Component", () => {
    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 1, firstName: "John", lastName: "Doe", username: "johndoe", email: "john@example.com" },
              { id: 2, firstName: "Jane", lastName: "Smith", username: "janesmith", email: "jane@example.com" },
              { id: 3, firstName: "Michael", lastName: "Brown", username: "michaelb", email: "michael@example.com" },
              { id: 4, firstName: "Emily", lastName: "Johnson", username: "emilyj", email: "emily@example.com" },
            ]),
        })
      ) as jest.Mock;
    });
  
    afterEach(() => {
      jest.resetAllMocks();
    });
  

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

    expect(screen.getByText(/John\s+Doe/)).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });

  test("shows multiple results for partial matches", () => {
    render(<UserSearch />);
    const searchInput = screen.getByPlaceholderText("Search for a user...");

    fireEvent.change(searchInput, { target: { value: "j" } });

    expect(screen.getByText(/John\s+Doe/)).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  test("clears results when search input is empty", () => {
    render(<UserSearch />);
    const searchInput = screen.getByPlaceholderText("Search for a user...");

    // search for something
    fireEvent.change(searchInput, { target: { value: "john" } });
    expect(screen.getByText(/John\s+Doe/)).toBeInTheDocument();

    // Clear the input
    fireEvent.change(searchInput, { target: { value: "" } });
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
});
