"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { IconType } from "react-icons";
import {
  FiBarChart,
  FiFileText,
  FiAlertTriangle,
} from "react-icons/fi";

export const RouteSelect = () => {
  return (
    <div className="space-y-1">
      <Route Icon={FiBarChart} selected={false} title="Dashboard" href="/" />
      <Route Icon={FiFileText} selected={false} title="Report" href="/report" />
      <Route Icon={FiAlertTriangle} selected={false} title="Login" href="/login" />
    </div>
  );
}

const Route = ({
  selected,
  Icon,
  title,
  href,
}: {
  selected: boolean;
  Icon: IconType;
  title: string;
  href: string;
}) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
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


/*
import React from "react";
import { IconType } from "react-icons";
import {
  FiHome,
  FiPaperclip,
  FiBarChart,
  FiFileText,
  FiAlertTriangle,
} from "react-icons/fi";

export const RouteSelect = () => {
  return (
    <div className="space-y-1">
      <Route Icon={FiBarChart} selected={true} title="Dashboard" />
      <Route Icon={FiFileText} selected={false} title="Report" />
      <Route Icon={FiAlertTriangle} selected={false} title="Warning" />
    </div>
  );
};

const Route = ({
  selected,
  Icon,
  title,
}: {
  selected: boolean;
  Icon: IconType;
  title: string;
}) => {
  return (
    <button
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
*/
