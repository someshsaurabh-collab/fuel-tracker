import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getMileage, groupByMonth, formatMonth } from '../utils/calculations';

export default function Analytics({ fillups }) {
  const monthlyData = useMemo(() => {
    const groups = groupByMonth(fillups);
    return groups.map(g => ({
      ...g,
      monthLabel: formatMonth(g.month),
      totalAmount: parseFloat(g.totalAmount.toFixed(0)),
      litres: parseFloat(g.litres.toFixed(1)),
    }));
  }, [fillups]);

  const mileageData = useMemo(() => {
    const sorted = [...fillups].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted
      .map(f => {
        const m = getMileage(f, fillups);
        if (!m) return null;
        return {
          date: new Date(f.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          mileage: m,
          odometer: f.odometer,
        };
      })
      .filter(Boolean);
  }, [fillups]);

  const costPerKmData = useMemo(() => {
    const sorted = [...fillups].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted
      .map(f => {
        const m = getMileage(f, fillups);
        if (!m) return null;
        const cpk = parseFloat((f.pricePerLitre / m).toFixed(2));
        return {
          date: new Date(f.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          costPerKm: cpk,
        };
      })
      .filter(Boolean);
  }, [fillups]);

  const totals = useMemo(() => {
    const totalSpend = fillups.reduce((s, f) => s + f.totalAmount, 0);
    const totalLitres = fillups.reduce((s, f) => s + f.litresFilled, 0);
    const bpclFills = fillups.filter(f => f.station === 'BPCL').length;
    const allMileages = fillups.map(f => getMileage(f, fillups)).filter(Boolean);
    const avgMileage = allMileages.length
      ? (allMileages.reduce((a, b) => a + b, 0) / allMileages.length).toFixed(1)
      : '—';
    return { totalSpend, totalLitres, bpclFills, avgMileage };
  }, [fillups]);

  if (fillups.length < 2) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
        <div className="text-5xl mb-4">📊</div>
        <h3 className="font-semibold text-slate-700 text-lg">Not enough data yet</h3>
        <p className="text-slate-400 text-sm mt-2">Add at least 2 fill-ups to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Spend" value={`₹${totals.totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
        <SummaryCard label="Total Litres" value={`${totals.totalLitres.toFixed(1)} L`} />
        <SummaryCard label="Avg Mileage" value={`${totals.avgMileage} km/l`} />
        <SummaryCard label="BPCL Fills" value={`${totals.bpclFills} / ${fillups.length}`} />
      </div>

      {/* Monthly Spend */}
      <ChartCard title="Monthly Spend (₹)" subtitle="Total petrol expense per month">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Spend']} />
            <Bar dataKey="totalAmount" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Monthly Litres */}
      <ChartCard title="Monthly Litres Consumed" subtitle="How much fuel you used per month">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}L`} />
            <Tooltip formatter={(v) => [`${v} L`, 'Litres']} />
            <Bar dataKey="litres" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Mileage Trend */}
      {mileageData.length >= 2 && (
        <ChartCard title="Mileage Trend (km/l)" subtitle="Fuel efficiency over time — full tanks only">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mileageData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={['auto', 'auto']} tickFormatter={v => `${v}`} />
              <Tooltip formatter={(v) => [`${v} km/l`, 'Mileage']} />
              <Line type="monotone" dataKey="mileage" stroke="#10b981" strokeWidth={2.5}
                dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Cost per km */}
      {costPerKmData.length >= 2 && (
        <ChartCard title="Cost per km (₹/km)" subtitle="How much each km costs you">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={costPerKmData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v) => [`₹${v}`, '₹ per km']} />
              <Line type="monotone" dataKey="costPerKm" stroke="#8b5cf6" strokeWidth={2.5}
                dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 text-center">
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="font-bold text-slate-800 text-base">{title}</h3>
      <p className="text-xs text-slate-400 mt-0.5 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}
