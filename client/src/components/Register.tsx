import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface FormErrors {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  general?: string;
}

interface ApiError {
  response?: {
    data?: {
      message: string;
    };
  };
}

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Password validation
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    }

    // Name validation
    if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters long";
    }
    if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters long";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      await register(formData);
      navigate("/");
    } catch (err: unknown) {
      const error = err as ApiError;
      if (error.response?.data?.message) {
        if (error.response.data.message.includes("username")) {
          setErrors((prev) => ({
            ...prev,
            username: "This username is already taken",
          }));
        } else if (error.response.data.message.includes("email")) {
          setErrors((prev) => ({
            ...prev,
            email: "This email is already registered",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            general: error.response?.data?.message || "Registration failed",
          }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Registration failed. Please try again.",
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="text-center mb-4">Register</h2>
              {errors.general && (
                <div className="alert alert-danger">{errors.general}</div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.username ? "is-invalid" : ""
                    }`}
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="firstName" className="form-label">
                    First Name
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.firstName ? "is-invalid" : ""
                    }`}
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  {errors.firstName && (
                    <div className="invalid-feedback">{errors.firstName}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="lastName" className="form-label">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.lastName ? "is-invalid" : ""
                    }`}
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                  {errors.lastName && (
                    <div className="invalid-feedback">{errors.lastName}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;