const configuration = () => {
  return {
    app: {
      name: process.env.APP_NAME,
      env: process.env.NODE_ENV,
      host: process.env.HOST,
      port: Number(process.env.PORT),
      domain: process.env.APP_DOMAIN,
    },
    database: {
      url: process.env.DATABASE_URL,
    },
    redis: {
      url: process.env.REDIS_URL,
    },
    auth: {
      jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
      jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
      jwtAccessTtl: process.env.JWT_ACCESS_TTL,
      jwtRefreshTtl: process.env.JWT_REFRESH_TTL,
    },
    docs: {
      username: process.env.DOCS_USERNAME,
      password: process.env.DOCS_PASSWORD,
      basicAuthEnabled: process.env.DOCS_BASIC_AUTH_ENABLED === 'true',
    },
  };
};

export default configuration;
