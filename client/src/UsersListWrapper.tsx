// UserEditFormWrapper.tsx
import React, { useEffect, useState } from "react";
import UserEditForm from "./UserEditForm";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

const UserEditFormWrapper: React.FC = () => {
  const [user, setUser] = useState<User>({
      id: 0, // default value; user can edit this field
      firstName: "",
      lastName: "",
      username: "",
      email: "",
    });
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
      


  useEffect(() => {
    // Replace the URL with your backend endpoint for the current user
    fetch("http://localhost:3000/user/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        setError("Error fetching user");
        setLoading(false);
      });
  }, []);

  const handleSave = (updatedUser: User) => {
    fetch(`http://localhost:3000/user/${updatedUser.id}`, {
      method: "PATCH", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update user");
        }
        return response.json();
      })
      .then((data) => {
        console.log("User updated successfully", data);
        // Optionally update local state or navigate away after a successful update
      })
      .catch((error) => {
        console.error("Error updating user:", error);
      });
  };

  if (loading) return <div>Loading user data...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>No user data found.</div>;

  return <UserEditForm userData={user} onSave={handleSave} />;
};

export default UserEditFormWrapper;
