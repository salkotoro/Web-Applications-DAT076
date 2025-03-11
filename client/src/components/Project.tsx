import "./project.css";

export const Project = () => {
  return (
    <div className="container">
      {/* Project Details */}
      <div className="project-container p-4">
        <h2 className="mb-3 text-center">Full Stack Engineer</h2>
        <p>
          <strong>Company:</strong> Evil Corp
        </p>
        <p>
          <strong>Name:</strong> John Doe
        </p>
        <p>
          <strong>Role:</strong> Full Time
        </p>
        <p>
          <strong>Compensation:</strong> $80,000/year
        </p>
        <p>
          <strong>Description:</strong> This project focuses on building a
          modern web application with Bootstrap and Express.
        </p>

        {/* Availability */}
        <p>
          <strong>Availability:</strong>{" "}
          <span className="availability available">Available</span>
        </p>

        {/* Timeline */}
        <p>
          <strong>Timeline:</strong> June 2024 - December 2024
        </p>

        {/* Contact Info */}
        <p>
          <strong>Contact Email:</strong>{" "}
          <a href="mailto:hr@evilcorp.com">hr@evilcorp.com</a>
        </p>
        <p>
          <strong>Phone:</strong> +1 (555) 123-4567
        </p>

        {/* Assigned Users */}
        <div className="mt-4">
          <h5>Assigned To:</h5>
          <div className="d-flex gap-2">
            <div className="profile-placeholder"></div>
            <div className="profile-placeholder"></div>
            <div className="profile-placeholder"></div>
          </div>
        </div>

        {/* Chat Button */}
        <div className="text-center mt-4">
          <a href="chat.html" className="btn btn-success">
            Chat with Company
          </a>
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center mt-3">
        <a href="homepage.html" className="btn btn-primary">
          Back
        </a>
      </div>
    </div>
  );
};