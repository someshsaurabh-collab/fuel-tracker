import { useMemo } from 'react';
import { getMileage, groupByMonth, formatMonth, pointsToRupees } from '../utils/calculations';

export default function Dashboard({ fillups, redemptions, settings, onNavigate }) {
  const sorted = useMemo(() =>
    [...fillups].sort((a, b) => new Date(b.date) - new Date(a.date)), [fillups]);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const thisMonthFills = fillups.filter(f => f.date.startsWith(thisMonth));
  const lastMonthFills = fillups.filter(f => f.date.startsWith(lastMonth));

  const thisMonthSpend = thisMonthFills.reduce((s, f) => s + f.totalAmount, 0);
  const lastMonthSpend = lastMonthFills.reduce((s, f) => s + f.totalAmount, 0);

  const totalPointsEarned = fillups.reduce((s, f) => s + (f.pointsEarned || 0), 0);
  const totalPointsRedeemed = redemptions.reduce((s, r) => s + r.pointsRedeemed, 0);
  const currentPoints = settings.startingPoints + totalPointsEarned - totalPointsRedeemed;
  const pointsValue = pointsToRupees(currentPoints, settings.valuePerPoint);

  const recentMileages = useMemo(() => {
    const fullFills = [...fillups]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .filter(f => f.tankType === 'full');
    const results = fullFills.map(f => getMileage(f, fillups)).filter(Boolean);
    return results.slice(-5);
  }, [fillups]);

  const avgMileage = recentMileages.length
    ? (recentMileages.reduce((a, b) => a + b, 0) / recentMileages.length).toFixed(1)
    : null;

  const lastFill = sorted[0];

  const spendDiff = lastMonthSpend > 0
    ? (((thisMonthSpend - lastMonthSpend) / lastMonthSpend) * 100).toFixed(0)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Good day! ⛽</h2>
            <p className="text-slate-500 text-sm mt-1">{settings.carName}</p>
          </div>
          <button
            onClick={() => onNavigate('add')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            + Add Fill-up
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="This Month"
          value={`₹${thisMonthSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          sub={spendDiff !== null
            ? `${spendDiff > 0 ? '▲' : '▼'} ${Math.abs(spendDiff)}% vs last month`
            : `${thisMonthFills.length} fill-up${thisMonthFills.length !== 1 ? 's' : ''}`}
          subColor={spendDiff > 0 ? 'text-red-500' : 'text-green-600'}
          icon="💸"
          accent="orange"
        />
        <StatCard
          label="Avg Mileage"
          value={avgMileage ? `${avgMileage} km/l` : '—'}
          sub="Last 5 full tanks"
          icon="📊"
          accent="blue"
        />
        <StatCard
          label="BPCL Points"
          value={currentPoints.toLocaleString('en-IN')}
          sub={`Worth ₹${pointsValue.toLocaleString('en-IN')}`}
          icon="🎯"
          accent="purple"
        />
        <StatCard
          label="Total Fill-ups"
          value={fillups.length}
          sub={`Since tracking began`}
          icon="🛢️"
          accent="green"
        />
      </div>

      {/* Last Fill-up */}
      {lastFill && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Last Fill-up</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Detail label="Date" value={new Date(lastFill.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
            <Detail label="Odometer" value={`${lastFill.odometer.toLocaleString('en-IN')} km`} />
            <Detail label="Litres" value={`${lastFill.litresFilled} L`} />
            <Detail label="Amount" value={`₹${lastFill.totalAmount.toLocaleString('en-IN')}`} />
            <Detail label="Station" value={lastFill.station} badge={lastFill.station === 'BPCL'} />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <ActionCard label="View All Logs" desc="Browse your fill history" icon="📋" onClick={() => onNavigate('logs')} />
        <ActionCard label="Analytics" desc="Trends & insights" icon="📈" onClick={() => onNavigate('analytics')} />
        <ActionCard label="Points Tracker" desc="SBI BPCL rewards" icon="🎯" onClick={() => onNavigate('points')} />
        <ActionCard label="Import / Export" desc="Backup your data" icon="📁" onClick={() => onNavigate('import')} />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, subColor = 'text-slate-400', icon, accent }) {
  const accents = {
    orange: 'bg-orange-50 border-orange-100',
    blue: 'bg-blue-50 border-blue-100',
    purple: 'bg-purple-50 border-purple-100',
    green: 'bg-green-50 border-green-100',
  };
  return (
    <div className={`rounded-2xl p-4 border ${accents[accent]} shadow-sm`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      <div className={`text-xs mt-1 ${subColor}`}>{sub}</div>
    </div>
  );
}

function Detail({ label, value, badge }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`font-semibold text-slate-800 text-sm ${badge ? 'inline-flex items-center gap-1' : ''}`}>
        {value}
        {badge && <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">✓</span>}
      </div>
    </div>
  );
}

function ActionCard({ label, desc, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-left hover:border-orange-200 hover:shadow-md transition-all group"
    >
      <div className="text-xl mb-2">{icon}</div>
      <div className="font-semibold text-slate-800 text-sm group-hover:text-orange-600 transition-colors">{label}</div>
      <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
    </button>
  );
}
