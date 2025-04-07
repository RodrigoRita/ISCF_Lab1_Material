"use client";

import { Sidebar } from "@/components/Sidebar/Sidebar";
import Report from "@/components/Report";
import { TopBar } from "@/components/Dashboard/TopBar";
import { useSession } from "next-auth/react";

export default function ReportPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex-1 p-6 bg-gray-50 ml-64">
      <Sidebar />
      <div className="flex-1 bg-white rounded-lg pb-4 shadow min-h-screen">
        <TopBar />

        <div className="p-10">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full">
            {session ? (
              <Report />
            ) : (
              <p className="text-center text-red-500 font-medium">
                Login in order to get a report
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


/*
"use client";

import { Sidebar } from "@/components/Sidebar/Sidebar";
import  Report  from "@/components/Report";
import { TopBar } from "@/components/Dashboard/TopBar";
import Login from "@/components/Login/Login";
import { useSession } from "next-auth/react";

export default function Test() {
  //const { data: session } = useSession();

      return (
        <div className="bg-white rounded-lg pb-4 shadow h-full min-h-screen">
              <TopBar />
              <div className="flex flex-col lg:flex-row justify-center gap-6 p-10">
              <Sidebar />
              <Report/>

              </div>
          

        </div>
      );
}
      */