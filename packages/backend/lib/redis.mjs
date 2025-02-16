import redis from "redis";

export async function createRedisClient({ url, insecure } = {}) {
  const client = redis.createClient({
    url,
    socket: {
      rejectUnauthorized: !insecure,
    },
  });

  await client.connect();

  return client;
}
