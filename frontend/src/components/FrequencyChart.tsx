import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import type { FrequencyBands } from "../types/analysis";

interface FrequencyChartProps {
  userMix: FrequencyBands;
  reference?: FrequencyBands;
}

const FrequencyChart = ({ userMix, reference }: FrequencyChartProps) => {
  const data = [
    {
      name: "Sub-Bass",
      "Your Mix": userMix.subBass,
      Reference: reference?.subBass ?? 0,
    },
    {
      name: "Bass",
      "Your Mix": userMix.bass,
      Reference: reference?.bass ?? 0,
    },
    {
      name: "Low-Mid",
      "Your Mix": userMix.lowMid,
      Reference: reference?.lowMid ?? 0,
    },
    {
      name: "Mid",
      "Your Mix": userMix.mid,
      Reference: reference?.mid ?? 0,
    },
    {
      name: "High-Mid",
      "Your Mix": userMix.highMid,
      Reference: reference?.highMid ?? 0,
    },
    {
      name: "Presence",
      "Your Mix": userMix.presence,
      Reference: reference?.presence ?? 0,
    },
    {
      name: "Brilliance",
      "Your Mix": userMix.brilliance,
      Reference: reference?.brilliance ?? 0,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 20, left: -20, bottom: 20 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#2d3e4f"
          vertical={false}
        />

        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          axisLine={{ stroke: "#2d3e4f" }}
          tickLine={false}
        />

        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          axisLine={{ stroke: "#2d3e4f" }}
          tickLine={false}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "#202f3d",
            border: "1px solid #2d3e4f",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#fff",
          }}
          formatter={(value: number | undefined) =>
            value !== undefined ? `${value.toFixed(1)}%` : "0%"
          }
        />

        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
          iconType="circle"
        />

        <Bar dataKey="Your Mix" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        {reference && (
          <Bar dataKey="Reference" fill="#64748b" radius={[4, 4, 0, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FrequencyChart;
