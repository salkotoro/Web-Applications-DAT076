# Web-Applications-DAT076

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

client
├── src                      # Source files for the frontend UI and client
│   ├── tests                # All frontend unit tests
│   ├── api                  # Creates an Axios instance for HTTP requests
│   ├── components           # Necessary components to construct the frontend UI and functionality
│   ├── context              # Handles authentication 
│   └── vite-env.d.ts        # TypeScript declaration file
└── ...

server
├── src                   # Source files for the backend UI and client
│   ├── controllers                  # All frontend unit tests
│   ├── middleware          # Creates an Axios instance for HTTP requests
│   ├── models              # Handles authentication 
│   ├── routers          # Creates an Axios instance for HTTP requests
│   ├── services             # Handles authentication 
│   ├── types               # Necessary components to construct the frontend UI and functionality
│   ├── index.ts             # Handles authentication 
│   └── start.ts                  #
└── ...