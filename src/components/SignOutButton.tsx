"use client";

import Button from "./ui/Button";

import { Loader2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { FC, HtmlHTMLAttributes, useState } from "react";
import { toast } from "react-hot-toast";

interface ISignOutButtonProps extends HtmlHTMLAttributes<HTMLButtonElement> {}

const SignOutButton: FC<ISignOutButtonProps> = ({ ...props }) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  return (
    <Button
      {...props}
      variant="ghost"
      onClick={async () => {
        setIsSigningOut(true);
        try {
          await signOut();
        } catch (error) {
          toast.error("There was a problem signing out");
        } finally {
          setIsSigningOut(false);
        }
      }}
    >
      {isSigningOut ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
    </Button>
  );
};

export default SignOutButton;
