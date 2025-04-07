"use client";

import { Sidebar } from "@/components/Sidebar/Sidebar";
import { TopBar } from "@/components/Dashboard/TopBar";
import Login from "@/components/Login/Login";
//import { useSession } from "next-auth/react";

export default function LoginPage() {
//  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex-1 p-6 bg-gray-50 ml-64">
      <Sidebar />
      
      <div className="flex-1 bg-white rounded-lg pb-4 shadow min-h-screen">
        <TopBar />
        <div className="p-10">
          <Login />
        </div>
      </div>
    </div>
  );
}
