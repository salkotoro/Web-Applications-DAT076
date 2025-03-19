import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import { UserType } from '../context/AuthContext';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  companyName?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

const Profile: React.FC = () => {
  const { user, isAuthenticated, isEmployer, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        companyName: user.companyName || '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user, isAuthenticated, navigate]);
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
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
    if (isEmployer() && !formData.companyName) {
      newErrors.companyName = "Company name is required for employers";
    }
    
    // Password validation (only if user wants to change password)
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters long";
      } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
        newErrors.newPassword = "Password must contain at least one uppercase letter";
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
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
      // Create an object with only the fields that have changed
      const updates: Record<string, string> = {};
      
      if (formData.firstName !== user?.firstName) {
        updates.firstName = formData.firstName;
      }
      
      if (formData.lastName !== user?.lastName) {
        updates.lastName = formData.lastName;
      }
      
      if (formData.email !== user?.email) {
        updates.email = formData.email;
      }
      
      if (isEmployer() && formData.companyName !== user?.companyName) {
        updates.companyName = formData.companyName || '';
      }
      
      if (formData.newPassword) {
        updates.password = formData.newPassword;
      }
      
      // Only make the API call if there are changes
      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Profile update error:', err);
      
      if (err.response?.data?.message) {
        setErrors(prev => ({
          ...prev,
          general: err.response.data.message
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          general: 'Failed to update profile. Please try again.'
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) {
    return <div className="text-center mt-5">Loading profile...</div>;
  }
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Edit Profile</h4>
            </Card.Header>
            <Card.Body>
              {success && (
                <Alert variant="success">
                  Profile updated successfully!
                </Alert>
              )}
              
              {errors.general && (
                <Alert variant="danger">
                  {errors.general}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
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
                  </Col>
                  
                  <Col md={6}>
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
                  </Col>
                </Row>
                
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
                
                {isEmployer() && (
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
                
                <hr className="my-4" />
                
                <h5>Change Password (Optional)</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.newPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.newPassword}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Leave blank if you don't want to change the password
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <div className="d-grid gap-2 mt-4">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile; 