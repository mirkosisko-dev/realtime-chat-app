"use client";

import axios from "axios";
import TextareaAutosize from "react-textarea-autosize";
import Button from "./ui/Button";

import { FC, useRef, useState } from "react";
import { toast } from "react-hot-toast";

interface IChatInputProps {
  chatPartner: IUser;
  chatId: string;
}

const ChatInput: FC<IChatInputProps> = ({ chatPartner, chatId }) => {
  const [input, setInput] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const sendMessage = async () => {
    setIsSending(true);
    try {
      await axios.post(`/api/message/send`, {
        text: input,
        chatId,
      });
      setInput("");
    } catch (error) {
      toast.error("Something went wrong, try again later");
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          value={input}
          placeholder={`Message ${chatPartner.name}`}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6"
        />

        <div
          onClick={() => textareaRef?.current?.focus()}
          className="py-2"
          aria-hidden="true"
        >
          <div className="py-px">
            <div className="h-9" />
          </div>
        </div>

        <div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrink-0">
            <Button
              onClick={sendMessage}
              disabled={!input}
              isLoading={isSending}
              type="submit"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
