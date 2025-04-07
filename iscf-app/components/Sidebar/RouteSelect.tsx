"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { IconType } from "react-icons";
import { FiBarChart, FiFileText, FiLogIn , FiLogOut } from "react-icons/fi";
import { useSession } from "next-auth/react";

export const RouteSelect = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleAuthNavigation = () => {
    if (!session) {
      router.push("/login"); // vai para login se não tiver sessão
    } else {
      router.push("/profile"); // ou outra rota, como "/dashboard", se quiseres
    }
  };

  return (
    <div className="space-y-1">
      <Route Icon={FiBarChart} selected={false} title="Dashboard" href="/" />
      <Route Icon={FiFileText} selected={false} title="Report" href="/report" />
      <Route
        Icon={session? FiLogOut:FiLogIn}
        selected={false}
        title={session ? "Sing out" : "Login"}
        href="/login"
      />
    </div>
  );
};

const Route = ({
  selected,
  Icon,
  title,
  href,
  onClick,
}: {
  selected: boolean;
  Icon: IconType;
  title: string;
  href?: string;
  onClick?: () => void;
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-start gap-2 w-full rounded px-2 py-1.5 text-sm transition-[box-shadow,_background-color,_color] ${
        selected
          ? "bg-white text-stone-950 shadow"
          : "hover:bg-stone-200 bg-transparent text-stone-500 shadow-none"
      }`}
    >
      <span className={selected ? "text-violet-500" : ""}>
        <Icon />
      </span>
      <span>{title}</span>
    </button>
  );
};

