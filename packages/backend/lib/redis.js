const redis = require("redis");

module.exports.createRedisClient = async function({ url, insecure } = {}) {
  const client = redis.createClient({
    url,
    socket: {
      rejectUnauthorized: !insecure,
    },
  });

  await client.connect();

  return client;
};
