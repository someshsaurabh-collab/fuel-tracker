import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { pointsToRupees } from '../utils/calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PointsTracker({ fillups, redemptions, settings, onAddRedemption, onDeleteRedemption }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), pointsRedeemed: '', note: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const totalEarned = fillups.reduce((s, f) => s + (f.pointsEarned || 0), 0);
  const totalRedeemed = redemptions.reduce((s, r) => s + r.pointsRedeemed, 0);
  const currentBalance = settings.startingPoints + totalEarned - totalRedeemed;
  const balanceValue = pointsToRupees(currentBalance, settings.valuePerPoint);

  // Cumulative points chart data
  const chartData = useMemo(() => {
    const events = [
      ...fillups.map(f => ({ date: f.date, delta: f.pointsEarned || 0, type: 'earn' })),
      ...redemptions.map(r => ({ date: r.date, delta: -r.pointsRedeemed, type: 'redeem' })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    let running = settings.startingPoints;
    return events.map(e => {
      running += e.delta;
      return {
        date: new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        points: running,
        value: parseFloat(pointsToRupees(running, settings.valuePerPoint).toFixed(0)),
      };
    });
  }, [fillups, redemptions, settings]);

  const handleRedeem = (e) => {
    e.preventDefault();
    if (!form.pointsRedeemed || isNaN(form.pointsRedeemed)) return;
    onAddRedemption({
      id: uuidv4(),
      date: form.date,
      pointsRedeemed: parseInt(form.pointsRedeemed),
      note: form.note,
    });
    setForm({ date: new Date().toISOString().slice(0, 10), pointsRedeemed: '', note: '' });
    setShowForm(false);
  };

  const bpclFills = fillups.filter(f => f.station === 'BPCL' && f.paymentMethod === 'SBI BPCL Card');

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-purple-200 text-sm font-medium">Current SBI BPCL Points</p>
            <div className="text-5xl font-bold mt-2">{currentBalance.toLocaleString('en-IN')}</div>
            <p className="text-purple-200 text-sm mt-1">≈ ₹{balanceValue.toLocaleString('en-IN')} value</p>
          </div>
          <div className="text-4xl">🎯</div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <MiniStat label="Starting" value={settings.startingPoints.toLocaleString('en-IN')} />
          <MiniStat label="Earned" value={`+${totalEarned.toLocaleString('en-IN')}`} />
          <MiniStat label="Redeemed" value={totalRedeemed > 0 ? `-${totalRedeemed.toLocaleString('en-IN')}` : '0'} />
        </div>
      </div>

      {/* Rate Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 rounded-xl p-2.5">💳</div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">SBI BPCL Credit Card</p>
            <p className="text-slate-400 text-xs mt-0.5">
              {settings.pointsPerHundred} pts per ₹100 · 1 pt = ₹{settings.valuePerPoint} ·
              {' '}{bpclFills.length} qualifying fills
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-slate-400">Eligible fills</p>
            <p className="font-bold text-purple-700 text-sm">{bpclFills.length} / {fillups.length}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-slate-800 text-base">Points Balance Over Time</h3>
          <p className="text-xs text-slate-400 mt-0.5 mb-4">Cumulative points including redemptions</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip formatter={(v, n) => [v.toLocaleString('en-IN'), n === 'points' ? 'Points' : '₹ Value']} />
              <Line type="monotone" dataKey="points" stroke="#8b5cf6" strokeWidth={2.5}
                dot={{ fill: '#8b5cf6', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Points log per fill */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Points Earned per Fill-up</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {[...fillups]
            .filter(f => f.pointsEarned > 0)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(f => (
              <div key={f.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {new Date(f.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-slate-400">₹{f.totalAmount.toLocaleString('en-IN')} · BPCL · SBI Card</p>
                </div>
                <span className="font-bold text-purple-600">+{f.pointsEarned} pts</span>
              </div>
            ))}
          {fillups.filter(f => f.pointsEarned > 0).length === 0 && (
            <p className="px-6 py-4 text-sm text-slate-400">No qualifying fills yet</p>
          )}
        </div>
      </div>

      {/* Redemptions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Redemption History</h3>
          <button onClick={() => setShowForm(v => !v)}
            className="text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold px-4 py-1.5 rounded-lg transition-colors">
            + Log Redemption
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleRedeem} className="px-6 py-4 bg-purple-50 border-b border-purple-100 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                <input type="date" value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Points Redeemed</label>
                <input type="number" placeholder="e.g. 500" value={form.pointsRedeemed}
                  onChange={e => setForm(p => ({ ...p, pointsRedeemed: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Note (optional)</label>
              <input type="text" placeholder="e.g. Used for petrol fill at BPCL" value={form.note}
                onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-purple-400" />
            </div>
            {form.pointsRedeemed && !isNaN(form.pointsRedeemed) && (
              <p className="text-xs text-purple-700 bg-purple-100 px-3 py-2 rounded-lg">
                ₹{pointsToRupees(parseInt(form.pointsRedeemed), settings.valuePerPoint).toLocaleString('en-IN')} value · Remaining after: {(currentBalance - parseInt(form.pointsRedeemed)).toLocaleString('en-IN')} pts
              </p>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 font-medium">Cancel</button>
              <button type="submit"
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white font-semibold transition-colors">Save</button>
            </div>
          </form>
        )}

        <div className="divide-y divide-slate-50">
          {[...redemptions].sort((a, b) => new Date(b.date) - new Date(a.date)).map(r => (
            <div key={r.id} className="px-6 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {r.note && <p className="text-xs text-slate-400">{r.note}</p>}
                <p className="text-xs text-slate-400">
                  ≈ ₹{pointsToRupees(r.pointsRedeemed, settings.valuePerPoint).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-red-500">−{r.pointsRedeemed} pts</span>
                <button onClick={() => {
                  if (confirmDelete === r.id) { onDeleteRedemption(r.id); setConfirmDelete(null); }
                  else setConfirmDelete(r.id);
                }} className={`text-xs ${confirmDelete === r.id ? 'text-red-500 font-semibold' : 'text-slate-300 hover:text-red-400'}`}>
                  {confirmDelete === r.id ? 'Confirm?' : '✕'}
                </button>
              </div>
            </div>
          ))}
          {redemptions.length === 0 && !showForm && (
            <p className="px-6 py-4 text-sm text-slate-400">No redemptions logged yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-white/10 rounded-xl px-3 py-2 text-center">
      <div className="text-white font-bold text-sm">{value}</div>
      <div className="text-purple-200 text-xs mt-0.5">{label}</div>
    </div>
  );
}
