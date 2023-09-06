"use client";

import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import axios from "axios";

import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

interface IFriendRequestsProps {
  incomingFriendRequests: IIncomingFriendRequest[];
  sessionId: string;
}

const FriendRequests: FC<IFriendRequestsProps> = ({
  incomingFriendRequests,
  sessionId,
}) => {
  const [friendRequests, setFriendRequests] = useState<
    IIncomingFriendRequest[]
  >(incomingFriendRequests);

  useEffect(() => {
    pusherClient.subscribe(
      toPusherKey(`user:${sessionId}:incoming_friend_requests`)
    );

    const friendRequestHandler = ({
      senderId,
      senderEmail,
    }: {
      senderId: string;
      senderEmail: string;
    }) => setFriendRequests((prev) => [...prev, { senderId, senderEmail }]);

    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusherKey(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, [sessionId]);

  const router = useRouter();

  const acceptFriendRequest = async (senderId: string) => {
    try {
      await axios.post("/api/friends/accept", { id: senderId });

      setFriendRequests((prev) =>
        prev.filter((request) => request.senderId !== senderId)
      );

      router.refresh();
    } catch (error) {}
  };

  const denyFriendRequest = async (senderId: string) => {
    await axios.post(`/api/friends/deny`, { id: senderId });

    setFriendRequests((prev) =>
      prev.filter((request) => request.senderId !== senderId)
    );

    router.refresh();
  };

  return (
    <>
      {friendRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to see here...</p>
      ) : (
        friendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <UserPlus className="text-black" />
            <p className="font-medium text-lg">{request.senderEmail}</p>
            <button
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
              aria-label="accept friend request"
              onClick={() => acceptFriendRequest(request.senderId)}
            >
              <Check className="font-semibold text-white w-3/4 h-3/4" />
            </button>

            <button
              className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
              aria-label="deny friend request"
              onClick={() => denyFriendRequest(request.senderId)}
            >
              <X className="font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;
