require('dotenv').config();

const Hapi = require('@hapi/hapi');
const NotesService = require('./services/postgres/NotesService');
const notes = require('./api/notes/index.js');
const NotesValidator = require('./validator/notes');
const ClientError = require('./exceptions/ClientError.js');

const init = async () => {
  const notesService = new NotesService();
  const server = Hapi.server({
    port: process.env.APP_PORT,
    host: process.env.APP_HOST,
    routes: {
      cors: {
        origin: ['*'], // Mengizinkan semua origin
      },
    },
  });

  await server.register({
    plugin: notes,
    options: {
      service: notesService,
      validator: NotesValidator,
    },
  });

  server.ext('onPreResponse', (request, h) => {

    const { response } = request;

    if (response instanceof ClientError) {

      const newResponse = h.response({
        status: 'fail',
        message: response.message
      });

      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.start(); // Memulai server

  console.log(`Server is running on ${server.info.uri}`);
};

init();
