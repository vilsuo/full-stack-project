const { Dockest, logLevel } = require('dockest');
const { createPostgresReadinessCheck } = require('dockest/readiness-check');

const dockest = new Dockest({
  composeFile: ['docker-compose.test.yaml'],
  dumpErrors: true,
  logLevel: logLevel.DEBUG,
});

// Specify the services from the Compose file that should be included in the integration test
const dockestServices = [
  {
    serviceName: 'postgres', // Must match a service in the Compose file
    readinessCheck: createPostgresReadinessCheck(),
  },
];

dockest.run(dockestServices);
