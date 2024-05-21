
export const EnvConfiguration = () => ({
  environment: process.env.NODE_ENV || 'dev',
  port: process.env.PORT || 3001,
  mongoDbUrl: process.env.MONGO_DB_URL,
  mongoUser: process.env.MONGO_USER,
  mongoPass: process.env.MONGO_PASS,
  defaultLimit: +process.env.DEFAULT_LIMIT || 10,
})