import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaBuilding, FaBriefcase, FaDollarSign, FaCalendarAlt, FaUsers, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/useAuth';
import projectService, { Project } from '../services/projectService';

// Extend the Project interface to include additional fields from the backend
interface ExtendedProject extends Project {
  createdAt?: string | Date;
  company?: string;
  employerEmail?: string;
}

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const { user } = auth;
  
  const [project, setProject] = useState<ExtendedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchProjectDetails(parseInt(id));
    }
  }, [id]);
  
  useEffect(() => {
    if (id && auth.isAuthenticated() && user?.userType === 'employee') {
      checkApplicationStatus(parseInt(id));
    }
  }, [id, auth.isAuthenticated(), user]);
  
  const fetchProjectDetails = async (projectId: number) => {
    try {
      setLoading(true);
      const data = await projectService.getProjectById(projectId);
      console.log("Project details:", data);
      setProject(data as ExtendedProject);
      setError(null);
    } catch (err) {
      console.error("Error fetching project details:", err);
      setError("Failed to load project details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  const checkApplicationStatus = async (projectId: number) => {
    try {
      setCheckingApplication(true);
      const hasApplied = await projectService.hasAppliedToProject(projectId);
      setHasApplied(hasApplied);
    } catch (err) {
      console.error("Error checking application status:", err);
    } finally {
      setCheckingApplication(false);
    }
  };
  
  const handleApply = async () => {
    if (!id || !auth.isAuthenticated() || user?.userType !== 'employee') {
      return;
    }
    
    try {
      setApplying(true);
      setApplicationError(null);
      
      await projectService.applyToProject(parseInt(id));
      
      setApplicationSuccess(true);
      setHasApplied(true);
      
      // Refresh project details after application
      fetchProjectDetails(parseInt(id));
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setApplicationSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Error applying to project:", err);
      setApplicationError(err.response?.data?.message || "Failed to apply to this project. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const handleContactEmployer = () => {
    if (project?.employerEmail) {
      window.location.href = `mailto:${project.employerEmail}?subject=Regarding ${project.name} Project`;
    }
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading project details...</p>
      </Container>
    );
  }
  
  if (error || !project) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || "Project not found"}
        </Alert>
        <Button variant="outline-secondary" onClick={() => navigate('/')}>
          <FaArrowLeft className="me-2" /> Back to Projects
        </Button>
      </Container>
    );
  }
  
  // Parse roles from string if needed
  let roles: string[] = [];
  if (typeof project.roles === 'string') {
    try {
      const parsedRoles = JSON.parse(project.roles);
      roles = Array.isArray(parsedRoles) ? parsedRoles : [project.roles];
    } catch (e) {
      roles = [project.roles];
    }
  } else if (Array.isArray(project.roles)) {
    roles = project.roles;
  }
  
  const isEmployer = user?.userType === 'employer';
  const isEmployee = user?.userType === 'employee';
  const isProjectOwner = isEmployer && project.employerId === user?.id;
  const isUserAuthenticated = auth.isAuthenticated();
  
  // Render application card based on user status
  const renderApplicationCard = () => {
    if (!isUserAuthenticated) {
      return (
        <Card className="shadow-sm mb-4">
          <Card.Body className="text-center p-4">
            <h4 className="mb-3">Interested in this project?</h4>
            <p>Sign in or register to apply for this project</p>
          </Card.Body>
        </Card>
      );
    }
    
    if (isEmployee) {
      if (hasApplied) {
        return (
          <Card className="shadow-sm mb-4 border-success">
            <Card.Body className="text-center p-4">
              <FaCheckCircle className="text-success mb-3" size={32} />
              <h4 className="mb-3">Application Submitted</h4>
              <p>You have already applied to this project. The employer will review your application and contact you if interested.</p>
              {project.employerEmail && (
                <Button
                  variant="outline-primary"
                  onClick={handleContactEmployer}
                  className="mt-2"
                >
                  <FaEnvelope className="me-2" />
                  Contact Employer
                </Button>
              )}
            </Card.Body>
          </Card>
        );
      }
      
      return (
        <Card className="shadow-sm mb-4">
          <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
            <h4 className="mb-3">Interested in this project?</h4>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Button 
                variant="primary" 
                size="lg" 
                className="px-4"
                onClick={handleApply}
                disabled={applying || !project.open || checkingApplication}
              >
                {applying ? 'Submitting...' : project.open ? 'Apply Now' : 'Project Closed'}
              </Button>
              
              {project.employerEmail && (
                <Button
                  variant="outline-primary"
                  size="lg"
                  className="px-4"
                  onClick={handleContactEmployer}
                >
                  <FaEnvelope className="me-2" />
                  Contact Employer
                </Button>
              )}
            </div>
            <p className="text-muted mt-3">
              After applying, the employer will be able to see your profile and contact you.
            </p>
          </Card.Body>
        </Card>
      );
    }
    
    return null;
  };
  
  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <Button 
            variant="outline-secondary" 
            className="mb-3"
            onClick={() => navigate('/')}
          >
            <FaArrowLeft className="me-2" /> Back to Projects
          </Button>
          <h1 className="mb-3">{project.name}</h1>
          
          <div className="d-flex flex-wrap align-items-center mb-2">
            <Badge bg={project.open ? "success" : "secondary"} className="me-2 mb-2">
              {project.open ? "Open" : "Closed"}
            </Badge>
            
            {roles.map((role, index) => (
              <Badge key={index} bg="info" className="me-2 mb-2">
                {role}
              </Badge>
            ))}
          </div>
          
          {applicationSuccess && (
            <Alert variant="success">
              You have successfully applied to this project!
            </Alert>
          )}
          
          {applicationError && (
            <Alert variant="danger">
              {applicationError}
            </Alert>
          )}
        </Col>
      </Row>
      
      <Row>
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4 className="mb-3">Project Description</h4>
              <p>{project.description}</p>
            </Card.Body>
          </Card>
          
          {renderApplicationCard()}
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4 className="mb-3">Project Details</h4>
              
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaBuilding className="text-secondary me-2" />
                  <strong>Company:</strong>
                </div>
                <p className="ms-4 mb-0">{project.company || "Company name unavailable"}</p>
              </div>
              
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaBriefcase className="text-secondary me-2" />
                  <strong>Role:</strong>
                </div>
                <p className="ms-4 mb-0">{roles[0] || "General"}</p>
              </div>
              
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaDollarSign className="text-secondary me-2" />
                  <strong>Salary:</strong>
                </div>
                <p className="ms-4 mb-0">${project.salary?.toLocaleString() || "Not specified"}</p>
              </div>
              
              {project.createdAt && (
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <FaCalendarAlt className="text-secondary me-2" />
                    <strong>Posted:</strong>
                  </div>
                  <p className="ms-4 mb-0">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {typeof project.employeeCount !== 'undefined' && (
                <div>
                  <div className="d-flex align-items-center mb-2">
                    <FaUsers className="text-secondary me-2" />
                    <strong>Applicants:</strong>
                  </div>
                  <p className="ms-4 mb-0">{project.employeeCount}</p>
                </div>
              )}
              
              {project.employerEmail && !isUserAuthenticated && (
                <div className="mt-4">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="w-100"
                    onClick={handleContactEmployer}
                  >
                    <FaEnvelope className="me-2" />
                    Contact Employer
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
          
          {isProjectOwner && (
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <h4 className="mb-3">Project Management</h4>
                <div className="d-grid gap-2">
                  <Button 
                    variant="outline-primary"
                    onClick={() => navigate('/projects/manage')}
                  >
                    Manage Projects
                  </Button>
                  
                  <Button 
                    variant="outline-secondary"
                    onClick={() => navigate(`/projects/${id}/employees`)}
                  >
                    View Applicants
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectDetails; 