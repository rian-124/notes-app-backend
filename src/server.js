const Hapi = require('@hapi/hapi');
const routes = require('./routes.js');

const init = async () => {
  const server = Hapi.server({
    port: 8000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'], // Mengizinkan semua origin
      },
    },
  });

  server.route(routes); // Mendaftarkan rute

  await server.start(); // Memulai server

  console.log(`Server is running on ${server.info.uri}`);
};

init();
