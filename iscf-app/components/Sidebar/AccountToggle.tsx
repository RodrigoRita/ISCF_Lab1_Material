"use client";

import React from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

export const AccountToggle = () => {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="border-b mb-4 mt-2 pb-4 border-stone-300">
      <button className="flex p-0.5 hover:bg-stone-200 rounded transition-colors relative gap-2 w-full items-center">
        <img
          src={user?.image || "https://api.dicebear.com/9.x/notionists/svg?seed=account"}
          alt="avatar"
          width={32}
          height={32}
          className="rounded-full bg-violet-500 shadow"
        />
        <div className="text-start">
          <span className="text-sm font-bold block">
            {user?.name || "User not authenticated"}
          </span>
          <span className="text-xs block text-stone-500">
            {user?.email || "no active session"}
          </span>
        </div>
      </button>
    </div>
  );
};

/*
import React from "react";
import Image from "next/image";


export const AccountToggle = () => {
  return (
    <div className="border-b mb-4 mt-2 pb-4 border-stone-300">
      <button className="flex p-0.5 hover:bg-stone-200 rounded transition-colors relative gap-2 w-full items-center">
      <Image
          src="https://api.dicebear.com/9.x/notionists/svg?seed=account"
          alt="avatar"
          width={32}
          height={32}
          className="rounded bg-violet-500 shadow"
        />
        <div className="text-start">
          <span className="text-sm font-bold block">XX Is Loading</span>
          <span className="text-xs block text-stone-500">xx@gmail.com</span>
        </div>

        
      </button>
    </div>
  );
};
*/