const InvariantError = require('../../exceptions/InvariantError');
const ExportsPayloadSchema = require('./schema');

const ExportsValidator = {
  validateExportNotesPayload: (payload) => {
    const validationResult = ExportsPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;