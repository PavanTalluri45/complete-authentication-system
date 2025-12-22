const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on("connect", () => {
    console.log("Redis Cloud connected successfully");
});

redisClient.on("error", (err) => {
    console.error("Redis connection error:", err);
});

(async () => {
    await redisClient.connect();
})();

module.exports = redisClient;
