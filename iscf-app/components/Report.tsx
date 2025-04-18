import React, { useState, useEffect, useRef } from "react";
import { ref, get } from "firebase/database";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import { database } from "lib/firebase";

// Chart.js + Register components
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

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
  const [minutes, setMinutes] = useState(10);
  const [summary, setSummary] = useState<Record<string, { max: number; min: number; avg?: number }> | null>(null);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const otherChartRef = useRef<HTMLCanvasElement>(null);

  const temperatureChartInstance = useRef<Chart | null>(null);
  const otherChartInstance = useRef<Chart | null>(null);

  // change locate
  
  useEffect(() => {
    const fetchData = async () => {
      const sensorRef = ref(database, "sensor_data");
      const snapshot = await get(sensorRef);
      if (snapshot.exists()) {
        const data: SensorData[] = Object.values(snapshot.val());
        processSummary(data);
      } else {
        console.error("No data found in Firebase.");
      }
    };
    fetchData();
  }, [days, hours, minutes]);
  

  const processSummary = (data: SensorData[]) => {
    if (data.length === 0) return;

    const latestTimestamp = Math.max(...data.map(item => item.timestamp));
    const timeRange = days * 24 * 60 + hours * 60 + minutes;
    //addd
    const filteredData = data.filter(item =>
      item.timestamp >= latestTimestamp - timeRange * 60
    );

    /*
    const filteredData = data
      .map(item => ({
        timestamp: item.timestamp,
        temperature: parseFloat(item.temperature as unknown as string),
        x: parseFloat(item.x as unknown as string),
        y: parseFloat(item.y as unknown as string),
        z: parseFloat(item.z as unknown as string)
      }))
      .filter(item => item.timestamp >= latestTimestamp - timeRange * 60);
    */

    if (filteredData.length === 0) return;

    const stats: Record<string, { max: number; min: number; avg?: number }> = {};
    ["temperature", "x", "y", "z"].forEach((key) => {
      const values = filteredData.map((item) => item[key as keyof SensorData] as number);
      const useAbs = ["x", "y", "z"].includes(key);
      const processedValues = useAbs ? values.map(Math.abs) : values;

      const max = Math.max(...processedValues);
      const min = Math.min(...processedValues);

      if (key === "temperature") {
        const sum = processedValues.reduce((sum, val) => sum + val, 0);
        const avg = sum / processedValues.length;
        stats[key] = { max, min, avg: isNaN(avg) ? 0 : avg };
      } else {
        stats[key] = { max, min };
      }
    });

    setSummary(stats);
    generateChart(filteredData);
    generateOtherChart(filteredData);
  };

  const generateChart = (data: SensorData[]) => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    if (temperatureChartInstance.current) {
      temperatureChartInstance.current.destroy();
    }

    temperatureChartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((item) => new Date(item.timestamp * 1000).toLocaleTimeString()),
        datasets: [
          {
            label: "Temperature",
            data: data.map((item) => item.temperature),
            borderColor: "red",
            fill: false,
          },
        ],
      },
    });
  };

  const generateOtherChart = (data: SensorData[]) => {
    if (!otherChartRef.current) return;
    const ctx = otherChartRef.current.getContext("2d");
    if (!ctx) return;

    if (otherChartInstance.current) {
      otherChartInstance.current.destroy();
    }

    otherChartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map((item) => new Date(item.timestamp * 1000).toLocaleTimeString()),
        datasets: [
          {
            label: "X Axis",
            data: data.map((item) => item.x),
            borderColor: "blue",
            fill: false,
          },
          {
            label: "Y Axis",
            data: data.map((item) => item.y),
            borderColor: "green",
            fill: false,
          },
          {
            label: "Z Axis",
            data: data.map((item) => item.z),
            borderColor: "purple",
            fill: false,
          },
        ],
      },
    });
  };

  const generatePDF = async () => {
    if (!summary) return;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 600]);
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let y = height - 50;
    page.drawText("Sensor Data Report", { x: 50, y, size: 15, font, color: rgb(0, 0, 0) });
    y -= 30;

    const now = new Date();
    page.drawText(`Generated: ${now.toLocaleString()}`, { x: 50, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
    y -= 15;

    const timeRangeText = `Analysis period: ${days > 0 ? `${days} day(s) ` : ''}${hours > 0 ? `${hours} hour(s) ` : ''}${minutes} minute(s)`;
    page.drawText(timeRangeText, { x: 50, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
    y -= 30;

    const temp = summary.temperature;
    page.drawText("Temperature", { x: 50, y, size: 12, font, color: rgb(0, 0, 0.5) });
    y -= 20;
    page.drawText(`• Average: ${temp.avg?.toFixed(2)} ºC`, { x: 60, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
    y -= 15;
    page.drawText(`• Maximum: ${temp.max.toFixed(2)} ºC`, { x: 60, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
    y -= 15;
    page.drawText(`• Minimum: ${temp.min.toFixed(2)} ºC`, { x: 60, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
    y -= 30;

    ["x", "y", "z"].forEach(axis => {
      const val = summary[axis];
      page.drawText(`${axis.toUpperCase()} axis:`, { x: 60, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
      y -= 15;
      page.drawText(`• Maximum: ${val.max.toFixed(2)} m/s²`, { x: 80, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
      y -= 15;
      page.drawText(`• Minimum: ${val.min.toFixed(2)} m/s²`, { x: 80, y, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
      y -= 20;
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, `Sensor_Report_${now.toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <h2 className="text-lg font-bold text-center mt-4">Sensor Summary</h2>

      <div>
        <label>Days: <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} min="0" /></label>
      </div>
      <div>
        <label>Hours: <input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} min="0" /></label>
      </div>
      <div>
        <label>Minutes: <input type="number" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} min="0" /></label>
      </div>

      <button
        onClick={generatePDF}
        className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition font-semibold"
      >
        Generate PDF
      </button>

      {summary && (
        <div className="w-full max-w-2xl mt-4">
          <h3 className="text-lg font-semibold mb-2">Summary Preview</h3>
          <div className="bg-gray-100 rounded p-4 space-y-2">
            <div>
              <strong>Temperature:</strong><br />
              Avg: {summary.temperature.avg?.toFixed(2)} ºC, Max: {summary.temperature.max.toFixed(2)} ºC, Min: {summary.temperature.min.toFixed(2)} ºC
            </div>
            <div>
              <strong>Acceleration:</strong><br />
              X: Max {summary.x.max.toFixed(2)} / Min {summary.x.min.toFixed(2)}<br />
              Y: Max {summary.y.max.toFixed(2)} / Min {summary.y.min.toFixed(2)}<br />
              Z: Max {summary.z.max.toFixed(2)} / Min {summary.z.min.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      <div className="mt-10">
        <canvas ref={chartRef} style={{ width: "100%", height: "300px" }} />
        <canvas ref={otherChartRef} style={{ width: "100%", height: "300px" }} />
      </div>
    </div>
  );
};

export default Report;


/*
import React, { useState, useEffect, useRef} from "react";
import { ref, get } from "firebase/database";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import { database } from "lib/firebase"; // Use existing Firebase config
import { Chart } from "chart.js";

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
  const [summary, setSummary] = useState<Record<string, { max: number; min: number; avg?: number }> | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null); // For Temperature Graph
  const otherChartRef = useRef<HTMLCanvasElement>(null); // For X, Y, Z Graph

  useEffect(() => {
    // verificar se tem dados
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
    fetchData();
  }, [days, hours, minutes]);
  useEffect(() => {
    console.log("Summary updated:", summary);
  }, [summary]);

// REPORT
  const processSummary = (data: SensorData[]) => {
    if (data.length === 0) {
      console.log("No data available");
      return;
    }
    // Find the latest timestamp
    const latestTimestamp = Math.max(...data.map(item => item.timestamp));
    const timeRange = days * 24 * 60 + hours * 60 + minutes;

    // Convert all values to numbers and filter
    const filteredData = data
      .map(item => ({
        timestamp: item.timestamp,
        temperature: parseFloat(item.temperature as unknown as string),
        x: parseFloat(item.x as unknown as string),
        y: parseFloat(item.y as unknown as string),
        z: parseFloat(item.z as unknown as string)
      }))
      .filter(item => item.timestamp >= latestTimestamp - timeRange * 60);
      
    if (filteredData.length === 0) {
      console.log("No data within selected time range");
      return;
    }
  
    const stats: Record<string, { max: number; min: number; avg?: number }> = {};
    ["temperature", "x", "y", "z"].forEach((key) => {
      const values = filteredData.map((item) => item[key as keyof SensorData] as number);
      const useAbs = ["x", "y", "z"].includes(key);
      const processedValues = useAbs ? values.map(Math.abs) : values;
  
      const max = Math.max(...processedValues);
      const min = Math.min(...processedValues);
      
      // Only calculate avg for temperature
      if (key === "temperature") {
        const sum = processedValues.reduce((sum, val) => sum + val, 0);
        const avg = sum / processedValues.length;
        stats[key] = { max, min, avg: isNaN(avg) ? 0 : avg }; // Fallback to 0 if NaN
      } else {
        stats[key] = { max, min };
      }
    }); 

    // Graficos
    const generateChart = (data: SensorData[]) => {
      if (!chartRef.current) return;
      const ctx = chartRef.current.getContext("2d");
      if (!ctx) return;
      
      new Chart(ctx, {
        type: "line",
        data: {
          labels: data.map((item) => new Date(item.timestamp * 1000).toLocaleTimeString()),
          datasets: [
            {
              label: "Temperature",
              data: data.map((item) => item.temperature),
              borderColor: "red",
              fill: false,
            },
          ],
        },
      });
    };
  
    const generateOtherChart = (data: SensorData[]) => {
      if (!otherChartRef.current) return;
      const ctx = otherChartRef.current.getContext("2d");
      if (!ctx) return;
      
      new Chart(ctx, {
        type: "line",
        data: {
          labels: data.map((item) => new Date(item.timestamp * 1000).toLocaleTimeString()),
          datasets: [
            {
              label: "X Axis",
              data: data.map((item) => item.x),
              borderColor: "blue",
              fill: false,
            },
            {
              label: "Y Axis",
              data: data.map((item) => item.y),
              borderColor: "green",
              fill: false,
            },
            {
              label: "Z Axis",
              data: data.map((item) => item.z),
              borderColor: "purple",
              fill: false,
            },
          ],
        },
      });
    };

    setSummary(stats);
    generateChart(filteredData); // Temperature Graph
    generateOtherChart(filteredData); // X, Y, Z Graph
  };

  
  
  //
  // Gerar PDF
  //
  const generatePDF = async () => {
    console.log("Generating PDF... Current summary:", summary);
    if (!summary) {
      console.error("Summary is null. Cannot generate PDF.");
      return;
    }
  
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 600]); // tamanho da folha PDF
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
    let yPosition = height - 50;
    
    // Title
    page.drawText("Sensor Data Report", {
      x: 50,
      y: yPosition,
      size: 15,
      font,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;
  
    // Report metadata
    const now = new Date();
    page.drawText(`Generated: ${now.toLocaleString()}`, {
      x: 50,
      y: yPosition,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 15;
  
    const timeRangeText = `Analysis period: ${days > 0 ? `${days} day(s) ` : ''}${hours > 0 ? `${hours} hour(s) ` : ''}${minutes} minute(s)`;
    page.drawText(timeRangeText, {
      x: 50,
      y: yPosition,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 30;
  
    // Temperature section
    page.drawText("Temperature", {
      x: 50,
      y: yPosition,
      size: 12,
      font,
      color: rgb(0, 0, 0.5),
    });
    yPosition -= 20;
  
    const tempData = summary.temperature;
    page.drawText(`• Average: ${tempData.avg?.toFixed(2)} ºC`, {
      x: 60,
      y: yPosition,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 15;
  
    page.drawText(`• Maximum: ${tempData.max.toFixed(2)} ºC`, {
      x: 60,
      y: yPosition,
      size: 10,
      font,
      color:rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 15;
  
    page.drawText(`• Minimum: ${tempData.min.toFixed(2)} ºC`, {
      x: 60,
      y: yPosition,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= 30;
  
    // Acceleration section
    page.drawText("Acceleration", {
      x: 50,
      y: yPosition,
      size: 12,
      font,
      color: rgb(0, 0, 0.5),
    });
    yPosition -= 20;
  
    // Process each axis
    ['x', 'y', 'z'].forEach(axis => {
      if (summary[axis]) {
        page.drawText(`${axis.toUpperCase()} axis:`, {
          x: 60,
          y: yPosition,
          size: 10,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= 15;
  
        page.drawText(`• Maximum: ${summary[axis].max.toFixed(2)} m/s²`, {
          x: 80,
          y: yPosition,
          size: 10,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= 15;
  
        page.drawText(`• Minimum: ${summary[axis].min.toFixed(2)} m/s²`, {
          x: 80,
          y: yPosition,
          size: 10,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= 20;
      }
      
    });
    
  
    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, `Sensor_Report_${now.toISOString().split('T')[0]}.pdf`);
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
*/
