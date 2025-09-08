const Joi = require('joi');

const ExportsPayloadSchema = Joi.object({
  targetEmail: Joi.string()
    .email({ tlds: { allow: true } })
    .required(),
});

module.exports = ExportsPayloadSchema;
