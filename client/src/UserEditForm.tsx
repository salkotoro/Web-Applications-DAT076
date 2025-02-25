import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap is imported

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

interface UserEditFormProps {
  userData: User; // Pass existing user data as a prop
  onSave: (updatedUser: User) => void; // Function to handle save action
}

const UserEditForm: React.FC<UserEditFormProps> = ({ userData, onSave }) => {
  const [user, setUser] = useState<User>(userData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(user);
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
      <div
        className="bg-white p-4 rounded shadow-lg w-100"
        style={{ maxWidth: "400px" }}
      >
        <h1 className="text-center mb-4">Edit User</h1>
        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label htmlFor="firstName" className="form-label">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={user.firstName}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="lastName" className="form-label">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={user.lastName}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={user.username}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-success w-100">
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserEditForm;
