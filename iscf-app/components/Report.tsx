"use client";

import { database } from "@/lib/firebase";
import { ref, get } from "firebase/database";

export default async function handler(req, res) {
  try {
    // Obter os dados do Firebase
    const dbRef = ref(database, "sensor_data");
    const snapshot = await get(dbRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No data available" });
    }

    const value = snapshot.val();
    console.log("Fetched Firebase Data:", value);

    // Processamento dos dados
    const formattedData = Object.keys(value).map((registerId) => ({
      timestamp: value[registerId].timestamp,
      acceleration_x: value[registerId].x,
      acceleration_y: value[registerId].y,
      acceleration_z: value[registerId].z,
      temperature: value[registerId].temperature,
    }));

    // Ordenar os dados pelo timestamp
    formattedData.sort((a, b) => a.timestamp - b.timestamp);

    // Responder com JSON
    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
