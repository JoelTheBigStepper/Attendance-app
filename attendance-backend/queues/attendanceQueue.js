const { Queue } = require("bullmq");
const { redisConnection } = require("./redisClient");

const attendanceQueue = new Queue("attendance", { connection: redisConnection });

module.exports = attendanceQueue;
