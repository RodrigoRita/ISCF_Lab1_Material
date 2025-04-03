import React, { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import { database } from "lib/firebase"; // Use existing Firebase config

interface SensorData {
  timestamp: number;
  temperature: number;
  x: number;
  y: number;
  z: number;
}

const Report = () => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(10); // Default to last 10 minutes
  const [summary, setSummary] = useState<Record<string, { max: number; min: number }> | null>(null);

  useEffect(() => {
    fetchData();
  }, [days, hours, minutes]);
  useEffect(() => {
    console.log("Summary updated:", summary);
  }, [summary]);
  
  

  const fetchData = async () => {
    const sensorRef = ref(database, "sensor_data");
    const snapshot = await get(sensorRef);
    if (snapshot.exists()) {
      const data: SensorData[] = Object.values(snapshot.val());
      console.log("Fetched Data:", snapshot.val());
      processSummary(data);
    } else {
      console.error("No data found in Firebase.");
    }
  };

  const processSummary = (data: SensorData[]) => {
    if (data.length === 0) return;
    
    // Find the latest timestamp
    const latestTimestamp = Math.max(...data.map(item => item.timestamp));
    const timeRange = days * 24 * 60 + hours * 60 + minutes;
    const filteredData = data.filter(item =>
      item.timestamp >= latestTimestamp - timeRange * 60
    );

    if (filteredData.length === 0) return;

    const stats: Record<string, { max: number; min: number }> = {};
    ["temperature", "x", "y", "z"].forEach((key) => {
      const values = filteredData.map((item) => item[key as keyof SensorData] as number);
      stats[key] = {
        max: Math.max(...values),
        min: Math.min(...values),
      };
    });

    setSummary(stats);
  };

  const generatePDF = async () => {
    console.log("Generating PDF... Current summary:", summary);
    if (!summary) {
      console.error("Summary is null. Cannot generate PDF.");
      return;
    }  

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 600]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let yPosition = height - 50;
    page.drawText("Sensor Summary", { x: 50, y: yPosition, size: 20, font, color: rgb(0, 0, 0) });
    yPosition -= 30;

    Object.entries(summary).forEach(([key, values]) => {
      page.drawText(`${key}: Avg: ${values.avg.toFixed(2)}, Max: ${values.max}, Min: ${values.min}`, {
        x: 50,
        y: yPosition,
        size: 14,
        font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, "Sensor_Summary.pdf");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <h2>Sensor Summary</h2>
      <div>
        <label>Days: 
        <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} min="0" />
        </label>
      </div>
      <div>
        <label>Hours: 
        <input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} min="0" />
        </label>
      </div>
      <div>
        <label>Minutes: 
        <input type="number" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} min="0" />
        </label>
      </div>
      <button
        onClick={generatePDF}
        className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition font-semibold">
        Generate PDF
      </button>
    </div>
  );
};

export default Report;
