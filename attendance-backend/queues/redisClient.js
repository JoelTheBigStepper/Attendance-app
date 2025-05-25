const { Redis } = require("ioredis");

const redisConnection = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: {}, // <== Required for Redis Cloud secure connection
});

module.exports = { redisConnection };
