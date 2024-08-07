import Joi from 'joi';

export const configModuleValidationSchema = Joi.object({
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNC: Joi.boolean().required(),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRES: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_EXPIRES: Joi.string().required(),
  HASH_ROUND: Joi.number().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_KEY: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_BUCKET_NAME: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT:  Joi.string().required(),
  REDIS_USERNAME:  Joi.string().required(),
  REDIS_PASSWORD:  Joi.string().required(),
  PRODUCTION_URL:  Joi.string().required(),
  DEVELOP_URL:  Joi.string().required(),
});
