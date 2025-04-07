"use client";

import React, { useState } from "react";
import { TopBar } from "./TopBar";
import Dashboard1 from "@/components/Dashboard1";
import { useSession } from "next-auth/react";
import { database } from "@/lib/firebase";
import { ref, set } from "firebase/database";

export const Dashboard = () => {
  const [delay, setDelay] = useState<number>(1);
  const { data: session } = useSession();

  const handleChangeDelay = async () => {
    try {
      await set(ref(database, "delay"), delay);
      alert("Delay value updated successfully!");
    } catch (error) {
      console.error("Error updating delay:", error);
      alert("Failed to update delay.");
    }
  };

  return (
    <div className="bg-white rounded-lg pb-4 shadow h-full min-h-screen">
      
      <TopBar />
      <div className="flex flex-col lg:flex-row justify-center gap-6 p-10">
        {/* Left: Graph Section */}
        <div className="flex-1">
          <Dashboard1 />
        </div>

        {/* Right: Delay Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm h-fit">
          <h2 className="text-lg font-semibold mb-4 text-center">
            Change the data extraction delay
          </h2>

          <ul className="text-sm text-gray-600 mb-4 list-none text-center">
            <li>Enter delay value in seconds</li>
          </ul>

          {session ? (
            <input
              type="number"
              step="1"
              value={delay}
              onChange={(e) => setDelay(parseInt(e.target.value) || 1)}
              className="border border-gray-300 rounded px-4 py-2 mb-4 w-full text-center focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Delay in seconds"
            />
          ) : (
            <p className="text-center text-sm text-red-500 mb-4">
              Login in order to change the delay
            </p>
          )}

          <button
            onClick={handleChangeDelay}
            className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition font-semibold"
          >
            Change Delay
          </button>
        </div>
      </div>
    </div>
  );
};
