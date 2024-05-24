import * as Joi from 'joi'

export const JoiValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  MONGO_DB_URL: Joi.required(),
  MONGO_USER: Joi.string(),
  MONGO_PASS: Joi.string(),
  DEFAULT_LIMIT: Joi.number().default(10),
})