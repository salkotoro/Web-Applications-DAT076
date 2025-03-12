import React, { useState } from 'react';
import { useAuth } from "../context/useAuth";
import { UserType } from "../context/AuthContext";
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';

interface MiniRegisterModalProps {
  show: boolean;
  onHide: () => void;
}

interface FormErrors {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  companyName?: string;
  general?: string;
}

const MiniRegisterModal: React.FC<MiniRegisterModalProps> = ({ show, onHide }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState<UserType>(UserType.EMPLOYEE);
  const [success, setSuccess] = useState(false);
  const { registerEmployee, registerEmployer } = useAuth();

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      email: '',
      companyName: '',
    });
    setErrors({});
    setSuccess(false);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    // Password validation
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
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

    // Company name validation for employers
    if (userType === UserType.EMPLOYER && !formData.companyName) {
      newErrors.companyName = "Company name is required for employers";
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

  const handleUserTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserType(e.target.value as UserType);
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Form submitted", formData);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (userType === UserType.EMPLOYER) {
        await registerEmployer(formData as any);
        console.log("Employer registered");
      } else {
        const { companyName, ...employeeData } = formData;
        await registerEmployee(employeeData);
        console.log("Employee registered");
      }
      setSuccess(true);
      // Don't hide the modal immediately, show success message
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.response?.data?.message) {
        if (err.response.data.message.includes("username")) {
          setErrors((prev) => ({
            ...prev,
            username: "This username is already taken",
          }));
        } else if (err.response.data.message.includes("email")) {
          setErrors((prev) => ({
            ...prev,
            email: "This email is already registered",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            general: err.response?.data?.message || "Registration failed",
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

  if (success) {
    return (
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Body className="text-center py-5">
          <FaCheckCircle size={50} className="text-success mb-3" />
          <h4>Registration Successful!</h4>
          <p className="text-muted">
            You are now logged in and ready to use the application.
          </p>
          <Button variant="success" onClick={handleClose} className="mt-3">
            Continue
          </Button>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Quick Registration</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errors.general && (
          <Alert variant="danger">{errors.general}</Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="d-block">Registration Type</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                name="userType"
                id="employee-modal"
                value={UserType.EMPLOYEE}
                checked={userType === UserType.EMPLOYEE}
                onChange={handleUserTypeChange}
                label="Employee"
              />
              <Form.Check
                inline
                type="radio"
                name="userType"
                id="employer-modal"
                value={UserType.EMPLOYER}
                checked={userType === UserType.EMPLOYER}
                onChange={handleUserTypeChange}
                label="Employer"
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              isInvalid={!!errors.username}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.username}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              isInvalid={!!errors.password}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="row">
            <div className="col">
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  isInvalid={!!errors.firstName}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col">
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  isInvalid={!!errors.lastName}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              required
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          {userType === UserType.EMPLOYER && (
            <Form.Group className="mb-3">
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                isInvalid={!!errors.companyName}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.companyName}
              </Form.Control.Feedback>
            </Form.Group>
          )}

          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default MiniRegisterModal; 