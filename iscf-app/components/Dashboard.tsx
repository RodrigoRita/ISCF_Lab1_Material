"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [yDomain, setYDomain] = useState<[number, number]>([-20, 20]); // Default min/max limits

  useEffect(() => {
    const dbRef = ref(database, "sensor_data");

    const unsubscribe = onValue(dbRef, (snapshot) => {
      const value = snapshot.val();
      console.log("Fetched Firebase Data:", value);

      if (value) {
        // Convert object data into an array for recharts
        const formattedData = Object.keys(value).map((registerId) => ({
          timestamp: value[registerId].timestamp,
          acceleration_x: value[registerId].x,
          acceleration_y: value[registerId].y,
          acceleration_z: value[registerId].z,
        }));

        // Sort by timestamp to ensure chronological order
        formattedData.sort((a, b) => a.timestamp - b.timestamp);

        setData(formattedData);

        // Calculate min/max values for Y-axis dynamically
        const allValues = formattedData.flatMap((d) => [d.acceleration_x, d.acceleration_y, d.acceleration_z]);
        const minY = Math.min(...allValues);
        const maxY = Math.max(...allValues);
        setYDomain([minY - 1, maxY + 1]); // Add small margin
      } else {
        console.log("No data available in Firebase.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 p-10 rounded-lg shadow-lg w-full max-w-5xl">
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(tick) => new Date(tick * 1000).toLocaleTimeString()}
              label={{ value: "Time", position: "insideBottom", offset: -5 }}
            />
            <YAxis domain={yDomain} label={{ value: "Acceleration (m/s²)", angle: -90, position: "insideLeft" }} />
            <Tooltip labelFormatter={(label) => `Time: ${new Date(label * 1000).toLocaleTimeString()}`} />
            <Legend verticalAlign="top" height={36} />
            <Line type="monotone" dataKey="acceleration_x" stroke="#8884d8" strokeWidth={2} name="X Acceleration" />
            <Line type="monotone" dataKey="acceleration_y" stroke="#82ca9d" strokeWidth={2} name="Y Acceleration" />
            <Line type="monotone" dataKey="acceleration_z" stroke="#ff7300" strokeWidth={2} name="Z Acceleration" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
}
