"use client";

import UnseenChatToast from "./UnseenChatToast";

import { pusherClient } from "@/lib/pusher";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface ISidebarChatListProps {
  friends: IUser[];
  userId: string;
}

interface IExtendedMessage extends IMessage {
  senderImg: string;
  senderName: string;
}

const SidebarChatList: FC<ISidebarChatListProps> = ({ friends, userId }) => {
  const [unseenMessages, setUnseenMessages] = useState<IMessage[]>([]);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.includes("chat"))
      setUnseenMessages((prev) =>
        prev.filter((message) => !pathname.includes(message.senderId))
      );
  }, [pathname]);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${userId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${userId}:friends`));

    const chatHandler = (extendedMessage: IExtendedMessage) => {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(
          userId,
          extendedMessage.senderId
        )}`;

      if (!shouldNotify) return;

      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          senderId={extendedMessage.senderId}
          senderImg={extendedMessage.senderImg}
          userId={userId}
          senderMsg={extendedMessage.text}
          senderName={extendedMessage.senderName}
        />
      ));
      setUnseenMessages((prev) => [...prev, extendedMessage]);
    };

    const newFriendHandler = () => router.refresh();

    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", newFriendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${userId}:friends`));
    };
  }, [userId, router, pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends.sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter((message) => {
          return message.senderId === friend.id;
        }).length;
        return (
          <li key={friend.id}>
            <a
              href={`/dashboard/chat/${chatHrefConstructor(userId, friend.id)}`}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-xs leading-6 font-semibold"
            >
              {friend.name}{" "}
              {unseenMessagesCount > 0 && (
                <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                  {unseenMessagesCount}
                </div>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
