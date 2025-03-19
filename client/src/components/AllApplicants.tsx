import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Spinner, Form, Dropdown } from 'react-bootstrap';
import { FaArrowLeft, FaEnvelope, FaCheck, FaTimes, FaFilter, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/useAuth';
import projectService, { ProjectApplicationDetails } from '../services/projectService';

const AllApplicants: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isEmployer } = useAuth();
  
  const [applications, setApplications] = useState<ProjectApplicationDetails[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ProjectApplicationDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Get unique project names for filter dropdown
  const uniqueProjects = applications.length > 0 
    ? [...new Set(applications.map(app => app.projectName))]
    : [];
  
  useEffect(() => {
    // Redirect if not employer
    if (isAuthenticated() && !isEmployer()) {
      navigate('/');
      return;
    }
    
    fetchAllApplicants();
  }, [isAuthenticated, isEmployer, navigate]);
  
  useEffect(() => {
    // Apply filters
    let filtered = [...applications];
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Filter by project
    if (projectFilter !== 'all') {
      filtered = filtered.filter(app => app.projectName === projectFilter);
    }
    
    // Search by name or email
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.employeeName.toLowerCase().includes(term) || 
        app.employeeEmail.toLowerCase().includes(term)
      );
    }
    
    setFilteredApplications(filtered);
  }, [applications, statusFilter, projectFilter, searchTerm]);
  
  const fetchAllApplicants = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllApplicants();
      setApplications(data);
      setFilteredApplications(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch applicants:', err);
      setError(err.response?.data?.message || 'Failed to load applicants. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewProject = (projectId: number) => {
    navigate(`/projects/${projectId}`);
  };
  
  const handleContactApplicant = (email: string) => {
    window.location.href = `mailto:${email}`;
  };
  
  const handleUpdateStatus = async (applicationId: number, status: 'accepted' | 'rejected') => {
    try {
      setActionInProgress(applicationId);
      await projectService.updateApplicationStatus(applicationId, status);
      
      // Update local state
      setApplications(apps => 
        apps.map(app => 
          app.applicationId === applicationId ? { ...app, status } : app
        )
      );
      
      // Show success message
      setSuccess(`Application ${status === 'accepted' ? 'accepted' : 'rejected'} successfully.`);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error(`Failed to ${status} application:`, err);
      setError(err.response?.data?.message || `Failed to ${status} application. Please try again.`);
    } finally {
      setActionInProgress(null);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge bg="success">Accepted</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge bg="warning" text="dark">Pending</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Button 
              variant="outline-secondary" 
              className="me-3"
              onClick={() => navigate('/')}
            >
              <FaArrowLeft className="me-2" /> Back to Home
            </Button>
            <h1 className="mb-0">All Applicants</h1>
          </div>
          <p className="lead">Manage applications for all your projects</p>
        </Col>
      </Row>
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading applicants...</p>
        </div>
      ) : applications.length === 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <h4 className="mb-3">No Applications Yet</h4>
            <p className="text-muted">You haven't received any applications yet.</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/projects/manage')}
            >
              Manage Projects
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h4 className="mb-3">Filters</h4>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaFilter className="me-2" />
                      Project
                    </Form.Label>
                    <Form.Select
                      value={projectFilter}
                      onChange={(e) => setProjectFilter(e.target.value)}
                    >
                      <option value="all">All Projects</option>
                      {uniqueProjects.map((project, index) => (
                        <option key={index} value={project}>
                          {project}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaFilter className="me-2" />
                      Status
                    </Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaSearch className="me-2" />
                      Search Applicants
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search by name or email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="card-title mb-4">Applications ({filteredApplications.length})</h3>
              {filteredApplications.length === 0 ? (
                <Alert variant="info">
                  No applications match your filters.
                </Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Applicant</th>
                      <th>Role</th>
                      <th>Applied On</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((application) => (
                      <tr key={application.applicationId}>
                        <td>
                          <Button
                            variant="link"
                            className="p-0 text-decoration-none"
                            onClick={() => handleViewProject(application.projectId)}
                          >
                            {application.projectName}
                          </Button>
                        </td>
                        <td>
                          <div>
                            <strong>{application.employeeName}</strong>
                          </div>
                          <div className="text-muted small">{application.employeeEmail}</div>
                        </td>
                        <td>{application.role}</td>
                        <td>{formatDate(application.appliedDate)}</td>
                        <td>{getStatusBadge(application.status)}</td>
                        <td>
                          <div className="d-flex">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleContactApplicant(application.employeeEmail)}
                            >
                              <FaEnvelope className="me-1" /> Contact
                            </Button>
                            
                            {application.status === 'pending' && (
                              <Dropdown>
                                <Dropdown.Toggle variant="outline-primary" size="sm" id={`dropdown-${application.applicationId}`}>
                                  {actionInProgress === application.applicationId ? 'Processing...' : 'Actions'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item 
                                    onClick={() => handleUpdateStatus(application.applicationId, 'accepted')}
                                    disabled={actionInProgress === application.applicationId}
                                  >
                                    <FaCheck className="text-success me-2" /> Accept
                                  </Dropdown.Item>
                                  <Dropdown.Item 
                                    onClick={() => handleUpdateStatus(application.applicationId, 'rejected')}
                                    disabled={actionInProgress === application.applicationId}
                                  >
                                    <FaTimes className="text-danger me-2" /> Reject
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default AllApplicants; 