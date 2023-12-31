import Image from "next/image";
import Link from "next/link";

import { getFriendsByUserId } from "@/helpers/getFriendsByUserId";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { chatHrefConstructor } from "@/lib/utils";
import { Message } from "@/lib/validations/message";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

const page = async () => {
  const session = await getServerSession(authOptions);

  if (!session) return notFound();

  const friends = await getFriendsByUserId(session.user.id);

  const friendsWithLastMessage = await Promise.all(
    friends.map(async (friend) => {
      const [lastMessage]: string[] = await fetchRedis(
        "zrange",
        `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
        -1,
        -1
      );

      const parsedLastMessage = JSON.parse(lastMessage) as Message;

      return {
        ...friend,
        lastMessage: parsedLastMessage,
      };
    })
  );

  return (
    <div className="container py-12">
      <h1 className="font-bold text-5xl mb-8">Recent chats</h1>
      <div className="flex flex-col gap-3">
        {friendsWithLastMessage.length === 0 ? (
          <p className="text-xs text-zinc-500">Nothing to show here...</p>
        ) : (
          friendsWithLastMessage.map((friend) => (
            <div
              className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md"
              key={friend.id}
            >
              <div className="absolute right-4 inset-y-0 flex items-center">
                <ChevronRight className="h-7 w-7 text-zinc-400" />
              </div>

              <Link
                href={`/dashboard/chat/${chatHrefConstructor(
                  session.user.id,
                  friend.id
                )}`}
                className="relative sm:flex sm:items-center"
              >
                <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                  <div className="relative h-6 w-6">
                    <Image
                      referrerPolicy="no-referrer"
                      src={friend.image}
                      alt={`${friend.name} profile picture`}
                      fill
                      className="rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold">{friend.name}</h4>
                  <p className="mt-1 max-w-md">
                    <span className="text-zinc-400">
                      {friend.lastMessage.senderId === session.user.id
                        ? "You: "
                        : ""}
                    </span>
                    {friend.lastMessage.text}
                  </p>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default page;
