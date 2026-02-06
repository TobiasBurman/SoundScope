import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AudioAnalysis } from '../types';

interface FrequencyChartProps {
  userMix: AudioAnalysis;
  reference?: AudioAnalysis | null;
}

export default function FrequencyChart({ userMix, reference }: FrequencyChartProps) {
  if (!userMix.frequencies) return null;

  const data = [
    {
      name: 'Sub-Bass',
      'Your Mix': userMix.frequencies.subBass,
      'Reference': reference?.frequencies?.subBass || 0
    },
    {
      name: 'Bass',
      'Your Mix': userMix.frequencies.bass,
      'Reference': reference?.frequencies?.bass || 0
    },
    {
      name: 'Low-Mid',
      'Your Mix': userMix.frequencies.lowMid,
      'Reference': reference?.frequencies?.lowMid || 0
    },
    {
      name: 'Mid',
      'Your Mix': userMix.frequencies.mid,
      'Reference': reference?.frequencies?.mid || 0
    },
    {
      name: 'High-Mid',
      'Your Mix': userMix.frequencies.highMid,
      'Reference': reference?.frequencies?.highMid || 0
    },
    {
      name: 'Presence',
      'Your Mix': userMix.frequencies.presence,
      'Reference': reference?.frequencies?.presence || 0
    },
    {
      name: 'Brilliance',
      'Your Mix': userMix.frequencies.brilliance,
      'Reference': reference?.frequencies?.brilliance || 0
    }
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2d3e4f" vertical={false} />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          axisLine={{ stroke: '#2d3e4f' }}
          tickLine={false}
        />
        <YAxis 
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          axisLine={{ stroke: '#2d3e4f' }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#202f3d',
            border: '1px solid #2d3e4f',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#fff'
          }}
          formatter={(value: number | undefined) => value !== undefined ? `${value.toFixed(1)}%` : '0%'}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
          iconType="circle"
        />
        <Bar dataKey="Your Mix" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        {reference && <Bar dataKey="Reference" fill="#64748b" radius={[4, 4, 0, 0]} />}
      </BarChart>
    </ResponsiveContainer>
  );
}