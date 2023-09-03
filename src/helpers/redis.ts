type Command = "zrange" | "sismember" | "get" | "smembers";

export const fetchRedis = async (
  command: Command,
  ...args: (string | number)[]
) => {
  const commandUrl = `${
    process.env.UPSTASH_REDIS_REST_URL
  }/${command}/${args.join("/")}`;

  const response = await fetch(commandUrl, {
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
    },
    cache: "no-store",
  });

  if (!response.ok)
    throw new Error(`Error executing redis command: ${response.statusText}`);

  const data = await response.json();

  return data.result;
};
