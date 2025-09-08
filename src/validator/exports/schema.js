const Joi = require('joi');

const ExportsPayloadSchema = Joi.object({
  targetEmail: Joi.string().required(),
});

module.exports = ExportsPayloadSchema;