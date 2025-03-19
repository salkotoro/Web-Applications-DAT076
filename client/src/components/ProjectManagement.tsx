import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaUsers } from 'react-icons/fa';
import projectService, { Project, ProjectDTO } from '../services/projectService';

interface ProjectFormData {
  name: string;
  role: string;
  description: string;
  salary: number;
}

const ProjectManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    role: '',
    description: '',
    salary: 0
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployerProjects();
  }, []);

  const fetchEmployerProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getEmployerProjects();
      setProjects(data);
      setApiError(null);
    } catch (err) {
      console.error('Failed to fetch employer projects:', err);
      setApiError('Failed to load your projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    }
    
    if (!formData.role.trim()) {
      errors.role = 'Role is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (formData.salary <= 0) {
      errors.salary = 'Salary must be greater than 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      description: '',
      salary: 0
    });
    setFormErrors({});
    setSuccess(null);
    setSubmitting(false);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (project: Project) => {
    setCurrentProject(project);
    
    // Parse roles from string if needed
    let role = '';
    if (typeof project.roles === 'string') {
      try {
        const roles = JSON.parse(project.roles);
        role = Array.isArray(roles) && roles.length > 0 ? roles[0] : '';
      } catch (e) {
        role = project.roles || '';
      }
    } else if (Array.isArray(project.roles) && project.roles.length > 0) {
      role = project.roles[0];
    }
    
    setFormData({
      name: project.name,
      role: role,
      description: project.description,
      salary: project.salary
    });
    
    setShowEditModal(true);
  };

  const openDeleteModal = (project: Project) => {
    setCurrentProject(project);
    setShowDeleteModal(true);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare project data
      const projectData: ProjectDTO = {
        name: formData.name,
        description: formData.description,
        salary: formData.salary,
        roles: JSON.stringify([formData.role])
      };
      
      // Create project
      const newProject = await projectService.createProject(projectData);
      
      setSuccess('Project created successfully!');
      
      // Update projects list
      setProjects(prev => [...prev, newProject]);
      
      // Close modal after a delay
      setTimeout(() => {
        setShowCreateModal(false);
        resetForm();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setFormErrors(prev => ({
        ...prev,
        general: err.response?.data?.message || 'Failed to create project. Please try again.'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentProject) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare project data
      const projectData: Partial<ProjectDTO> = {
        name: formData.name,
        description: formData.description,
        salary: formData.salary,
        roles: JSON.stringify([formData.role])
      };
      
      // Update project
      const updatedProject = await projectService.updateProject(currentProject.idProj, projectData);
      
      setSuccess('Project updated successfully!');
      
      // Update projects list
      setProjects(prev => 
        prev.map(p => p.idProj === updatedProject.idProj ? updatedProject : p)
      );
      
      // Close modal after a delay
      setTimeout(() => {
        setShowEditModal(false);
        resetForm();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to update project:', err);
      setFormErrors(prev => ({
        ...prev,
        general: err.response?.data?.message || 'Failed to update project. Please try again.'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProject) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Delete project
      await projectService.deleteProject(currentProject.idProj);
      
      setSuccess('Project deleted successfully!');
      
      // Update projects list
      setProjects(prev => prev.filter(p => p.idProj !== currentProject.idProj));
      
      // Close modal after a delay
      setTimeout(() => {
        setShowDeleteModal(false);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      setFormErrors(prev => ({
        ...prev,
        general: err.response?.data?.message || 'Failed to delete project. Please try again.'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading your projects...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button 
                variant="outline-secondary" 
                className="me-2"
                onClick={() => navigate('/')}
              >
                <FaArrowLeft className="me-1" /> Back
              </Button>
              <h1 className="d-inline-block mb-0 ms-2">Project Management</h1>
            </div>
            <Button 
              variant="primary" 
              onClick={openCreateModal}
            >
              <FaPlus className="me-2" />
              Create New Project
            </Button>
          </div>
          <p className="lead mt-3">
            Manage projects for {user?.companyName}
          </p>
        </Col>
      </Row>

      {apiError && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">{apiError}</Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              {projects.length === 0 ? (
                <div className="text-center py-5">
                  <p>You haven't created any projects yet.</p>
                  <Button variant="primary" onClick={openCreateModal}>
                    <FaPlus className="me-2" />
                    Create Your First Project
                  </Button>
                </div>
              ) : (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Description</th>
                      <th>Salary</th>
                      <th>Status</th>
                      <th>Employees</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(project => {
                      // Parse roles from string if needed
                      let role = '';
                      if (typeof project.roles === 'string') {
                        try {
                          const roles = JSON.parse(project.roles);
                          role = Array.isArray(roles) && roles.length > 0 ? roles[0] : 'General';
                        } catch (e) {
                          role = project.roles || 'General';
                        }
                      } else if (Array.isArray(project.roles) && project.roles.length > 0) {
                        role = project.roles[0];
                      } else {
                        role = 'General';
                      }
                      
                      return (
                        <tr key={project.idProj}>
                          <td>{project.name}</td>
                          <td>{role}</td>
                          <td className="text-truncate" style={{ maxWidth: '300px' }}>
                            {project.description}
                          </td>
                          <td>${project.salary.toLocaleString()}</td>
                          <td>
                            <span className={`badge ${project.open ? 'bg-success' : 'bg-secondary'}`}>
                              {project.open ? 'Open' : 'Closed'}
                            </span>
                          </td>
                          <td>{project.employeeCount || 0}</td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-2"
                              onClick={() => openEditModal(project)}
                            >
                              <FaEdit /> Edit
                            </Button>
                            <Button 
                              variant="outline-info" 
                              size="sm" 
                              className="me-2"
                              onClick={() => navigate(`/projects/${project.idProj}/applicants`)}
                            >
                              <FaUsers /> Applicants
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => openDeleteModal(project)}
                            >
                              <FaTrash /> Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Project Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Project</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateProject}>
          <Modal.Body>
            {formErrors.general && <Alert variant="danger">{formErrors.general}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!formErrors.name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Control
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                isInvalid={!!formErrors.role}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.role}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Salary</Form.Label>
              <Form.Control
                type="number"
                name="salary"
                value={formData.salary || ''}
                onChange={handleChange}
                isInvalid={!!formErrors.salary}
                required
                min="0"
                step="1000"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.salary}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                isInvalid={!!formErrors.description}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={submitting || !!success}
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Project</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditProject}>
          <Modal.Body>
            {formErrors.general && <Alert variant="danger">{formErrors.general}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!formErrors.name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Control
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                isInvalid={!!formErrors.role}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.role}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Salary</Form.Label>
              <Form.Control
                type="number"
                name="salary"
                value={formData.salary || ''}
                onChange={handleChange}
                isInvalid={!!formErrors.salary}
                required
                min="0"
                step="1000"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.salary}
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                isInvalid={!!formErrors.description}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={submitting || !!success}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Project Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formErrors.general && <Alert variant="danger">{formErrors.general}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <p>Are you sure you want to delete the project: <strong>{currentProject?.name}</strong>?</p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteProject}
            disabled={submitting || !!success}
          >
            {submitting ? 'Deleting...' : 'Delete Project'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProjectManagement; 