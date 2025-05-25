const Queue = require("bull");
const Redis = require("ioredis");

const commonOptions = {
  host: "redis-18022.c241.us-east-1-4.ec2.redns.redis-cloud.com",
  port: 18022,
  password: "izohOyAMd8zryJXAezC59lXoAFQ1PfPi",
  tls: {
    servername: "redis-18022.c241.us-east-1-4.ec2.redns.redis-cloud.com"
  }
};

const createClient = (type) => {
  // Adjust settings based on the client type
  const options = {
    ...commonOptions,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
  };
  return new Redis(options);
};

const attendanceQueue = new Queue("attendanceQueue", {
  createClient,
});

module.exports = attendanceQueue;
