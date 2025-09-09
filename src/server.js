require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const NotesService = require('./services/postgres/NotesService');
const notes = require('./api/notes/index.js');
const NotesValidator = require('./validator/notes');
const ClientError = require('./exceptions/ClientError.js');
const UsersService = require('./services/postgres/UsersService.js');
const users = require('./api/users/index.js');
const UsersValidator = require('./validator/users/index.js');
const authentications = require('./api/authentications/index.js');
const AuthenticationsService = require('./services/postgres/AuthenticationsService.js');
const TokenManager = require('./tokenize/TokenManager.js');
const AuthenticationsValidator = require('./validator/authentications/index.js');
// collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService.js');
const ExportsValidator = require('./validator/exports/index.js');

const uploads = require('./api/uploads');
const StorageService = require('./services/S3/StorageService');
const UploadsValidator = require('./validator/uploads');
const Inert = require('@hapi/inert');

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const notesService = new NotesService(collaborationsService);
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  // local version
  // const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));
  const storageService = new StorageService();

  const server = Hapi.server({
    port: process.env.APP_PORT,
    host: process.env.APP_HOST,
    routes: {
      cors: {
        origin: ['*'], // Mengizinkan semua origin
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert
    }
  ]);

  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCSESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        notesService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    console.log(response);

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
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
