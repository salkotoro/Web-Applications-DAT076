import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ListGroup, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/useAuth';
import { FaPlus, FaBuilding, FaBriefcase, FaSearch, FaFilter } from 'react-icons/fa';
import projectService, { Project } from '../services/projectService';

const HomePage: React.FC = () => {
  const { user, isEmployer } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await projectService.getAllProjects();
        
        // Map API response to include our display properties
        const projectsWithDisplayProps = data.map(project => {
          // Parse roles from string if needed
          let role = 'General';
          if (typeof project.roles === 'string') {
            try {
              const parsedRoles = JSON.parse(project.roles);
              role = Array.isArray(parsedRoles) && parsedRoles.length > 0 ? parsedRoles[0] : 'General';
            } catch (e) {
              role = project.roles || 'General';
            }
          } else if (Array.isArray(project.roles) && project.roles.length > 0) {
            role = project.roles[0];
          }
          
          return {
            ...project,
            role,
            // Use the company name provided by the API
            company: project.company || 'Unknown Company'
          };
        });
        
        setProjects(projectsWithDisplayProps);
        setFilteredProjects(projectsWithDisplayProps);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);
  
  // Handle search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProjects(projects);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = projects.filter(project => {
      // Get comparable values
      const name = project.name.toLowerCase();
      const role = (project.role || '').toLowerCase();
      const company = (project.company || '').toLowerCase();
      const description = project.description.toLowerCase();
      
      switch (searchFilter) {
        case 'name':
          return name.includes(query);
        case 'role':
          return role.includes(query);
        case 'company':
          return company.includes(query);
        case 'all':
        default:
          return name.includes(query) || 
                 role.includes(query) || 
                 company.includes(query) || 
                 description.includes(query);
      }
    });
    
    setFilteredProjects(filtered);
  }, [searchQuery, searchFilter, projects]);

  // Handler for navigating to project management
  const goToProjectManagement = () => {
    navigate('/projects/manage');
  };

  // Handler for viewing project details
  const viewProjectDetails = (projectId: number) => {
    navigate(`/projects/${projectId}`);
  };
  
  // Handler for search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handler for filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchFilter(e.target.value);
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-4 mb-4">
            Welcome, <span className="text-primary">{user?.firstName || 'Guest'}</span>!
          </h1>
          
          {isEmployer() ? (
            <div className="mb-4">
              <p className="lead">
                As an employer, you can create and manage projects for your company{' '}
                <strong>{user?.companyName}</strong>.
              </p>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={goToProjectManagement}
                className="mt-2"
              >
                <FaPlus className="me-2" />
                Manage Your Projects
              </Button>
            </div>
          ) : (
            <p className="lead mb-4">
              Browse available projects and find opportunities that match your skills.
            </p>
          )}
        </Col>
      </Row>

      {!isEmployer() && (
        <>
          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm">
                <Card.Body>
                  <Form>
                    <Row>
                      <Col lg={9}>
                        <InputGroup>
                          <InputGroup.Text>
                            <FaSearch />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                          />
                        </InputGroup>
                      </Col>
                      <Col lg={3}>
                        <InputGroup>
                          <InputGroup.Text>
                            <FaFilter />
                          </InputGroup.Text>
                          <Form.Select value={searchFilter} onChange={handleFilterChange}>
                            <option value="all">All Fields</option>
                            <option value="name">Project Name</option>
                            <option value="role">Role</option>
                            <option value="company">Company</option>
                          </Form.Select>
                        </InputGroup>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        
          <Row>
            <Col>
              <h2 className="mb-4">Available Projects {searchQuery && `(${filteredProjects.length} results)`}</h2>
              
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-3">Loading projects...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : filteredProjects.length === 0 ? (
                <Alert variant="info">
                  {searchQuery ? "No projects match your search criteria." : "No projects available at this time."}
                </Alert>
              ) : (
                <ListGroup>
                  {filteredProjects.map(project => (
                    <ListGroup.Item 
                      key={project.idProj} 
                      action 
                      onClick={() => viewProjectDetails(project.idProj)}
                      className="mb-2 shadow-sm"
                    >
                      <Row>
                        <Col xs={8}>
                          <h5>{project.name}</h5>
                          <div className="d-flex align-items-center text-muted mb-2">
                            <FaBriefcase className="me-2" />
                            <span>{project.role}</span>
                          </div>
                        </Col>
                        <Col xs={4} className="text-end">
                          <div className="d-flex align-items-center justify-content-end text-muted">
                            <FaBuilding className="me-2" />
                            <span>{project.company}</span>
                          </div>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              viewProjectDetails(project.idProj);
                            }}
                          >
                            View Details
                          </Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default HomePage; 