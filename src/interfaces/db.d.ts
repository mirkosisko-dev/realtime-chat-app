interface IUser {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface IChat {
  id: string;
  messages: IMessage[];
}

interface IFriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
}

interface IMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}
