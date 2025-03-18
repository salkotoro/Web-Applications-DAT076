
# Top level:
.
├── client                   # Frontend client, frontend server, frontend tests
│   ├── src                  # Source files for the frontend UI and client
│   └── ...                  # Configuration files
├── client_mockup            # Initial mockup and frontend brainstorming of the application 
├── Report                   # Main report in .pdf, as well as .md. 
├── server                   # Backend server, along with its tests.
│   ├── src                  # All frontend unit tests
│   ├── test                 # All backend tests
│   ├── .env                 # Necessary components to construct the frontend UI and functionality 
│   └── ...                  #
└── README.md                # Current file

# Client:
client
├── src                      # Source files for the frontend UI and client
│   ├── tests                # All frontend unit tests
│   ├── api                  # Creates an Axios instance for HTTP requests
│   ├── components           # Necessary components to construct the frontend UI and functionality
│   ├── context              # Handles authentication 
│   ├── ...                  # More loose components
│   └── vite-env.d.ts        # TypeScript declaration file
└── ...

# Server:
server
├── src                      # Source files for the backend UI and client
│   ├── controllers          # Controllers for user and project interactions
│   ├── middleware           # Authentication middleware
│   ├── model                # Obsolete 
│   ├── models               # Handles authentication 
│   ├── router               # Obsolete
│   ├── routers              # Maps HTTP requests
│   ├── service              # Obsolete 
│   ├── services             # Service layer of operations and logic
│   ├── types                # Typescript declaration
│   ├── index.ts             # Acts as the entry point to launch the server
│   └── start.ts             # Sets up and configures the core Express application
└── ...

