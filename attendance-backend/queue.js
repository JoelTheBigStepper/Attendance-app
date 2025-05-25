// attendance-backend/queue.js
const Queue = require("bull");
const Redis = require("ioredis");

const redisConfig = {
  host: "redis-18022.c241.us-east-1-4.ec2.redns.redis-cloud.com",
  port: 18022, // replace with your Redis port
  password: "izohOyAMd8zryJXAezC59lXoAFQ1PfPi",
  tls: {} // if applicable
};

const redis = new Redis(redisConfig);

// Create the queue
const attendanceQueue = new Queue("attendanceQueue", {
  redis: redisConfig,
});

module.exports = attendanceQueue;
