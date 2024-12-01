"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesBarChart = () => {
  const data = {
    labels: ["Alice", "Bob", "Charlie", "David", "Eve"],
    datasets: [
      {
        label: "Sales",
        data: [12000, 15000, 8000, 7000, 14000],
        backgroundColor: "rgba(75, 192, 192)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: $${context.raw}`,
        },
      },
      legend: { display: true, position: "top" },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default SalesBarChart;
