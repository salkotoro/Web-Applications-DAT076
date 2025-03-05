import React, { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa"; // User icon

// Define User interface
interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}



const UserSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  useEffect(() => {
    // Replace this URL with your backend endpoint for fetching users
    fetch("http://localhost:3000/user/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);
  // Handle input change and filter users
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === "") {
      setFilteredUsers([]);
    } else {
      const results = users.filter((user) =>
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