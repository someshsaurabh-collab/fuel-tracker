import { useState, useMemo } from 'react';
import { getMileage, getKmDriven } from '../utils/calculations';

export default function LogsTable({ fillups, onEdit, onDelete }) {
  const [filterMonth, setFilterMonth] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const sorted = useMemo(() =>
    [...fillups].sort((a, b) => new Date(b.date) - new Date(a.date)), [fillups]);

  const months = useMemo(() => {
    const set = new Set(fillups.map(f => f.date.slice(0, 7)));
    return [...set].sort().reverse();
  }, [fillups]);

  const filtered = filterMonth
    ? sorted.filter(f => f.date.startsWith(filterMonth))
    : sorted;

  const handleDelete = (id) => {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  if (fillups.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
        <div className="text-5xl mb-4">⛽</div>
        <h3 className="font-semibold text-slate-700 text-lg">No fill-ups yet</h3>
        <p className="text-slate-400 text-sm mt-2">Add your first fill-up to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600">Filter:</span>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-orange-400">
          <option value="">All months</option>
          {months.map(m => (
            <option key={m} value={m}>{formatMonthLabel(m)}</option>
          ))}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} entries</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Date', 'Odometer', 'Km driven', 'Litres', '₹/L', 'Amount', 'Mileage', 'Tank', 'Station', 'Points', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => {
                const mileage = getMileage(f, fillups);
                const km = getKmDriven(f, fillups);
                return (
                  <tr key={f.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                      {new Date(f.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">{f.odometer.toLocaleString('en-IN')} km</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">{km ? `${km.toLocaleString('en-IN')} km` : '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">{f.litresFilled} L</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">₹{f.pricePerLitre}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-800">₹{f.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {mileage
                        ? <span className={`font-semibold ${mileage >= 15 ? 'text-green-600' : mileage >= 12 ? 'text-orange-500' : 'text-red-500'}`}>{mileage} km/l</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium
                        ${f.tankType === 'full' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {f.tankType === 'full' ? 'Full' : 'Partial'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium
                        ${f.station === 'BPCL' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {f.station}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {f.pointsEarned > 0
                        ? <span className="text-purple-600 font-semibold">+{f.pointsEarned}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button onClick={() => onEdit(f)}
                          className="text-slate-400 hover:text-orange-500 transition-colors text-xs font-medium">Edit</button>
                        <button onClick={() => handleDelete(f.id)}
                          className={`text-xs font-medium transition-colors ${confirmDelete === f.id ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}>
                          {confirmDelete === f.id ? 'Confirm?' : 'Del'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatMonthLabel(yyyymm) {
  const [y, m] = yyyymm.split('-');
  return new Date(y, m - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}
