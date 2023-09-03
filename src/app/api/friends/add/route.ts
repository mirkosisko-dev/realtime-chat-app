import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    const idToAdd = (await fetchRedis(
      "get",
      `user:email:${emailToAdd}`
    )) as string;

    if (!idToAdd) return new Response("User not found", { status: 400 });

    const session = await getServerSession(authOptions);

    if (!session) return new Response("Unauthorized", { status: 401 });

    if (idToAdd === session.user.id)
      return new Response("You cannot add yourself", { status: 400 });

    // Check if friend request already sent
    const isRequestAlreadySent = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1;

    if (isRequestAlreadySent)
      return new Response("Friend request already sent", { status: 400 });

    // Check if user is already added
    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriends)
      return new Response("Already friends", { status: 400 });

    // Send request
    db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);

    return new Response("Friend request sent", { status: 200 });
  } catch (error) {
    if (error instanceof ZodError)
      return new Response("Invalid request payload", { status: 422 });

    return new Response("Something went wrong", { status: 400 });
  }
}
