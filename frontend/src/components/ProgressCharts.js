import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const ACCENT = '#c8f135';
const BLUE   = '#5b8af5';
const ORANGE = '#f5a35b';
const PINK   = '#e85d9a';

const RANGES = [
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: 'All Time', days: Infinity },
];

const fmt = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-[#383838] rounded-[4px] px-3 py-2 text-[12px] font-['DM_Mono']">
      <p className="text-[#555] mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const ChartCard = ({ title, children }) => (
  <div className="bg-[#161616] border border-[#2a2a2a] rounded-[4px] p-5 mb-6">
    <div className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-[#555] mb-4">{title}</div>
    {children}
  </div>
);

const ProgressCharts = ({ measurements }) => {
  const [range, setRange] = useState(RANGES[2]);

  if (!measurements?.length) {
    return (
      <div className="flex items-center justify-center h-48 border border-[#2a2a2a] rounded-[4px]">
        <p className="text-[#555] text-[13px] font-['DM_Sans']">No measurements to chart yet.</p>
      </div>
    );
  }

  const cutoff = range.days === Infinity ? 0 : Date.now() - range.days * 86400000;
  const sorted = [...measurements]
    .filter(m => new Date(m.date || m.createdAt).getTime() >= cutoff)
    .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt));

  const data = sorted.map(m => ({
    date: fmt(m.date || m.createdAt),
    Weight:     m.weight     ?? null,
    'Body Fat': m.bodyFat    ?? null,
    Muscle:     m.muscleMass ?? null,
    Waist:      m.waist      ?? null,
    Chest:      m.chest      ?? null,
  }));

  const axisStyle = { fill: '#555', fontSize: 10, fontFamily: 'DM Mono' };
  const gridStroke = '#2a2a2a';

  return (
    <div>
      {/* Range selector */}
      <div className="flex gap-2 mb-6">
        {RANGES.map(r => (
          <button
            key={r.label}
            onClick={() => setRange(r)}
            className={`font-['DM_Mono'] text-[11px] uppercase tracking-[0.06em] px-3 py-1.5 rounded-[4px] transition-colors ${
              range.label === r.label
                ? 'bg-[rgba(200,241,53,0.12)] text-[#c8f135] border border-[#c8f135]'
                : 'border border-[#383838] text-[#555] hover:text-[#888]'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {data.length < 2 ? (
        <p className="text-[#555] text-[13px] font-['DM_Sans'] text-center py-8">Not enough data points for this range.</p>
      ) : (
        <>
          <ChartCard title="Weight (kg)">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis tick={axisStyle} domain={['auto','auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Weight" stroke={ACCENT} strokeWidth={2} dot={{ r: 3, fill: ACCENT }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Body Fat (%)">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis tick={axisStyle} domain={['auto','auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Body Fat" stroke={ORANGE} strokeWidth={2} dot={{ r: 3, fill: ORANGE }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Waist vs Chest (cm)">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis tick={axisStyle} domain={['auto','auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'DM Mono', color: '#555' }} />
                <Line type="monotone" dataKey="Waist" stroke={PINK} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="Chest" stroke={BLUE} strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Muscle Mass (kg)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis tick={axisStyle} domain={['auto','auto']} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Muscle" fill={BLUE} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </div>
  );
};

export default ProgressCharts;
