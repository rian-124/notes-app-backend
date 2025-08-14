const Hapi = require('@hapi/hapi');
const NotesService = require('./services/inMemory.js/NotesService.js');
const notes = require('./api/notes/index.js');

const init = async () => {
  const notesService = new NotesService();
  const server = Hapi.server({
    port: 5000,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
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
    },
  });

  await server.start(); // Memulai server

  console.log(`Server is running on ${server.info.uri}`);
};

init();
