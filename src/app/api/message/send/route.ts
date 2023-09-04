import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Message, messageValidator } from "@/lib/validations/message";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { text, chatId } = await req.json();

    const session = await getServerSession(authOptions);

    if (!session) return new Response("Unauthorized", { status: 401 });

    const [user1, user2] = chatId.split("--");

    if (session.user.id !== user1 && session.user.id !== user2)
      return new Response("Unauthorized", { status: 401 });

    const friendId = session.user.id === user1 ? user2 : user1;

    const friendList = (await fetchRedis(
      "smembers",
      `user:${session.user.id}:friends`
    )) as string[];

    const isFriend = friendList.includes(friendId);

    if (!isFriend) return new Response("Unauthorized", { status: 401 });

    // All valid
    const senderResult = (await fetchRedis(
      "get",
      `user:${session.user.id}`
    )) as string;

    const sender = JSON.parse(senderResult) as IUser;

    const timestamp = Date.now();

    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      timestamp,
      text,
    };

    const message = messageValidator.parse(messageData);

    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    if (error instanceof Error)
      return new Response(error.message, { status: 500 });

    if (error instanceof z.ZodError)
      return new Response("Invalid request payload", { status: 422 });

    return new Response("Internal server error", { status: 500 });
  }
}
