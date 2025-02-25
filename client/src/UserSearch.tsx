import React, { useState } from "react";
import { FaUser } from "react-icons/fa"; // User icon

// Define User interface
interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

// Fake user data (to be replaced with backend data)
const fakeUsers: User[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    email: "john@example.com",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    username: "janesmith",
    email: "jane@example.com",
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Brown",
    username: "michaelb",
    email: "michael@example.com",
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Johnson",
    username: "emilyj",
    email: "emily@example.com",
  },
];

const UserSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Handle input change and filter users
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setFilteredUsers([]);
    } else {
      const results = fakeUsers.filter((user) =>
        `${user.firstName} ${user.lastName}`
          .toLowerCase()
          .includes(value.toLowerCase())
      );
      setFilteredUsers(results);
    }
  };

  return (
    <div className="container mt-4">
      <div className="position-relative">
        <input
          type="text"
          className="form-control"
          placeholder="Search for a user..."
          value={query}
          onChange={handleSearch}
        />
        {filteredUsers.length > 0 && (
          <ul className="list-group position-absolute w-100 mt-1 shadow bg-white">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className="list-group-item d-flex align-items-center"
              >
                <FaUser className="me-2 text-primary" /> {/* User icon */}
                {user.firstName} {user.lastName}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
