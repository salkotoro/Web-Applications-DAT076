import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaEnvelope, FaExternalLinkAlt, FaBuilding, FaBriefcase, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import { useAuth } from '../context/useAuth';
import projectService, { MyApplication } from '../services/projectService';

const MyApplications: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isEmployee } = useAuth();
  
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Redirect if not employee
    if (isAuthenticated() && !isEmployee()) {
      navigate('/');
      return;
    }
    
    fetchMyApplications();
  }, [isAuthenticated, isEmployee, navigate]);
  
  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const data = await projectService.getMyApplications();
      setApplications(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch applications:', err);
      setError(err.response?.data?.message || 'Failed to load your applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewProjectDetails = (projectId: number) => {
    navigate(`/projects/${projectId}`);
  };
  
  const handleContactEmployer = (email: string) => {
    window.location.href = `mailto:${email}`;
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
            <h1 className="mb-0">My Applications</h1>
          </div>
          <p className="lead">Track the status of your project applications</p>
        </Col>
      </Row>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading your applications...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : applications.length === 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <h4 className="mb-3">No Applications Yet</h4>
            <p className="text-muted">You haven't applied to any projects yet.</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/')}
            >
              Browse Projects
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="card-title mb-4">Applications ({applications.length})</h3>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Applied On</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.projectId}>
                      <td>{application.projectName}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaBuilding className="text-secondary me-2" />
                          {application.companyName}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaBriefcase className="text-secondary me-2" />
                          {application.role}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaCalendarAlt className="text-secondary me-2" />
                          {formatDate(application.appliedDate)}
                        </div>
                      </td>
                      <td>{getStatusBadge(application.status)}</td>
                      <td>
                        <div className="d-flex">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleViewProjectDetails(application.projectId)}
                          >
                            <FaExternalLinkAlt className="me-1" /> View
                          </Button>
                          {application.employerEmail && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleContactEmployer(application.employerEmail!)}
                            >
                              <FaEnvelope className="me-1" /> Contact
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          
          <Card className="mt-4 shadow-sm">
            <Card.Body>
              <h4 className="mb-3">Application Status Guide</h4>
              <div className="d-flex flex-wrap gap-4">
                <div>
                  <Badge bg="warning" text="dark" className="mb-2">Pending</Badge>
                  <p className="small mb-0">Your application is under review by the employer</p>
                </div>
                <div>
                  <Badge bg="success" className="mb-2">Accepted</Badge>
                  <p className="small mb-0">Your application has been accepted</p>
                </div>
                <div>
                  <Badge bg="danger" className="mb-2">Rejected</Badge>
                  <p className="small mb-0">Your application was not selected for this project</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default MyApplications; 