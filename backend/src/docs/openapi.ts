const openApiSpec = {
  openapi: '3.0.3',

  info: {
    title: 'OpsMate API',
    version: '1.0.0',
    description: 'REST API untuk OpsMate Admin, Technician, dan Customer.',
  },

  servers: [
    {
      url: '/api',
      description: 'Current server',
    },
  ],

  tags: [
    {
      name: 'Health',
    },
    {
      name: 'Authentication',
    },
    {
      name: 'Customers',
    },
    {
      name: 'Technicians',
    },
    {
      name: 'Work Orders',
    },
    {
      name: 'Service Requests',
    },
  ],

  paths: {
    '/health': {
      get: {
        tags: ['Health'],

        summary: 'Check API health',

        responses: {
          '200': {
            description: 'API is running',
          },
        },
      },
    },
  },
};

export default openApiSpec;
