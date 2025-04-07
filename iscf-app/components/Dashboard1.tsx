"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type SensorData = {
  temperature: number;
  timestamp: number;
  x: number;
  y: number;
  z: number;
};


export default function Dashboard1() {
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dbRef = ref(database, "sensor_data");

    const unsubscribe = onValue(dbRef, (snapshot) => {
      const value = snapshot.val();
      console.log("Fetched Firebase Data:", value);

      if (value) {
        // Convert object data into an array for recharts
        const formattedData = Object.keys(value).map((registerId) => ({
          timestamp: value[registerId].timestamp,
          x: value[registerId].x,
          y: value[registerId].y,
          z: value[registerId].z,
          temperature: value[registerId].temperature,
        }));
        // Sort by timestamp to ensure chronological order
        formattedData.sort((a, b) => a.timestamp - b.timestamp);

        setData(formattedData);
      } else {
        console.log("No data available in Firebase.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 p-10 rounded-lg shadow-lg w-full max-w-5xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Graphic</h2>

      {loading ? (
        <p>Loading...</p>
      ) : data.length > 0 ? (
        <>
          {/* Acceleration Chart */}
          <h3 className="text-lg font-bold text-center mt-6">Acceleration Data</h3>
          <ResponsiveContainer width="101%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick * 1000).toLocaleTimeString()} />
              <YAxis domain={[-20,20]}/>
              <Tooltip labelFormatter={(label) => `Time: ${new Date(label * 1000).toLocaleTimeString()}`} />
              <Legend />
              <Line type="monotone" dataKey="x" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="y" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="z" stroke="#ff7300" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

          {/* Temperature Chart */}
          <h3 className="text-lg font-bold text-center mt-10">Temperature Data</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick * 1000).toLocaleTimeString()} />
              <YAxis domain={[0,50]}></YAxis>
              <Tooltip labelFormatter={(label) => `Time: ${new Date(label * 1000).toLocaleTimeString()}`} />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#ff0000" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
}

