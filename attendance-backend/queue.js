const Queue = require("bull");

const attendanceQueue = new Queue("attendanceQueue", {
  redis: {
    host: "redis-18022.c241.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 18022,
    password: "izohOyAMd8zryJXAezC59lXoAFQ1PfPi",
    tls: {
      servername: "redis-18022.c241.us-east-1-4.ec2.redns.redis-cloud.com"
    }
  }
});

module.exports = attendanceQueue;
