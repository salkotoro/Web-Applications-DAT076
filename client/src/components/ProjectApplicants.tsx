import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Alert, Badge, Spinner } from 'react-bootstrap';
import { 
  FaArrowLeft, 
  FaBuilding, 
  FaBriefcase, 
  FaDollarSign, 
  FaCalendarAlt, 
  FaUsers, 
  FaEnvelope, 
  FaEdit, 
  FaLock,
  FaUnlock
} from 'react-icons/fa';
import { useAuth } from '../context/useAuth';
import projectService, { Project, ProjectApplicant } from '../services/projectService';

interface ExtendedProject extends Project {
  createdAt?: string | Date;
  company?: string;
  employerEmail?: string;
}

const ProjectApplicants: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [project, setProject] = useState<ExtendedProject | null>(null);
  const [applicants, setApplicants] = useState<ProjectApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (id && isAuthenticated()) {
      fetchProjectData(parseInt(id));
    } else {
      navigate('/');
    }
  }, [id, isAuthenticated, navigate]);
  
  const fetchProjectData = async (projectId: number) => {
    try {
      setLoading(true);
      
      // Fetch project details
      const projectData = await projectService.getProjectById(projectId);
      setProject(projectData as ExtendedProject);
      
      // Fetch project applicants
      const applicantsData = await projectService.getProjectEmployees(projectId);
      
      // Transform the applicant data to extract the nested User data
      const formattedApplicants = applicantsData.map(app => {
        // If the user property exists, extract its data, otherwise use default empty data
        if (app.User) {
          return {
            id: app.User.id || app.id,
            username: app.User.username || '',
            firstName: app.User.firstName || '',
            lastName: app.User.lastName || '',
            email: app.User.email || '',
            joinedAt: app.joinedAt
          };
        }
        
        // Fallback for direct structure (might be the case in some API responses)
        return {
          id: app.id || 0,
          username: app.username || '',
          firstName: app.firstName || '',
          lastName: app.lastName || '',
          email: app.email || '',
          joinedAt: app.joinedAt || new Date().toISOString()
        };
      });
      
      setApplicants(formattedApplicants);
      
      setError(null);
    } catch (err: any) {
      console.error("Error fetching project data:", err);
      setError(err.response?.data?.message || "Failed to load project data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleProjectStatus = async () => {
    if (!project) return;
    
    try {
      await projectService.updateProject(project.idProj, {
        open: !project.open
      });
      
      // Refresh project data
      fetchProjectData(project.idProj);
    } catch (err: any) {
      console.error("Error updating project status:", err);
      setError(err.response?.data?.message || "Failed to update project status");
    }
  };
  
  const handleContactApplicant = (email: string) => {
    if (project) {
      window.location.href = `mailto:${email}?subject=Regarding Your Application to ${project.name}`;
    }
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading project and applicants...</p>
      </Container>
    );
  }
  
  if (error || !project) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || "Project not found"}
        </Alert>
        <Button variant="outline-secondary" onClick={() => navigate('/projects/manage')}>
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
  
  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/projects/manage')}
            >
              <FaArrowLeft className="me-2" /> Back to Projects
            </Button>
            
            <div>
              <Button
                variant="outline-primary"
                className="me-2"
                onClick={() => navigate(`/projects/manage/edit/${project.idProj}`)}
              >
                <FaEdit className="me-2" /> Edit Project
              </Button>
              
              <Button
                variant={project.open ? "outline-danger" : "outline-success"}
                onClick={handleToggleProjectStatus}
              >
                {project.open ? (
                  <><FaLock className="me-2" /> Close Project</>
                ) : (
                  <><FaUnlock className="me-2" /> Reopen Project</>
                )}
              </Button>
            </div>
          </div>
          
          <h1 className="mb-3">{project.name}</h1>
          
          <div className="d-flex flex-wrap align-items-center mb-3">
            <Badge bg={project.open ? "success" : "secondary"} className="me-2 mb-2">
              {project.open ? "Open" : "Closed"}
            </Badge>
            
            {roles.map((role, index) => (
              <Badge key={index} bg="info" className="me-2 mb-2">
                {role}
              </Badge>
            ))}
          </div>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4 className="mb-3">Project Description</h4>
              <p>{project.description}</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4 className="mb-3">Project Details</h4>
              
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaBuilding className="text-secondary me-2" />
                  <strong>Company:</strong>
                </div>
                <p className="ms-4 mb-0">{project.company || user?.companyName || "Not specified"}</p>
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
              
              <div>
                <div className="d-flex align-items-center mb-2">
                  <FaUsers className="text-secondary me-2" />
                  <strong>Applicants:</strong>
                </div>
                <p className="ms-4 mb-0">{applicants.length}</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h4 className="mb-0">Applicants ({applicants.length})</h4>
            </Card.Header>
            <Card.Body>
              {applicants.length === 0 ? (
                <div className="text-center py-5">
                  <FaUsers className="text-muted mb-3" size={48} />
                  <h5>No Applicants Yet</h5>
                  <p className="text-muted">
                    {project.open 
                      ? "Your project is open for applications. Check back later for applicants." 
                      : "Your project is currently closed. Reopen it to receive more applications."}
                  </p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Applied On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((applicant) => (
                      <tr key={applicant.id}>
                        <td>{applicant.firstName && applicant.lastName ? 
                            `${applicant.firstName} ${applicant.lastName}` : 
                            "Name not available"}
                        </td>
                        <td>{applicant.email || "Email not available"}</td>
                        <td>{new Date(applicant.joinedAt).toLocaleDateString()}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleContactApplicant(applicant.email)}
                            disabled={!applicant.email}
                          >
                            <FaEnvelope className="me-1" /> Contact
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectApplicants; 