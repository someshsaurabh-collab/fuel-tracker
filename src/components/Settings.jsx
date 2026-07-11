import { useState } from 'react';

export default function Settings({ settings, onSave }) {
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      startingPoints: parseInt(form.startingPoints) || 0,
      pointsPerHundred: parseFloat(form.pointsPerHundred) || 13,
      valuePerPoint: parseFloat(form.valuePerPoint) || 0.25,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-700 px-6 py-4">
        <h2 className="text-white font-bold text-lg">Settings</h2>
        <p className="text-slate-300 text-sm">Configure your car and rewards details</p>
      </div>
      <form onSubmit={handleSave} className="p-6 space-y-6">
        {/* Car details */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Car Details</h3>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Car Name / Model</label>
            <input value={form.carName} onChange={e => set('carName', e.target.value)}
              placeholder="e.g. Mahindra XUV 3XO AX5"
              className="w-full px-3 py-2.5 border-2 border-slate-200 focus:border-orange-400 rounded-xl text-sm outline-none" />
          </div>
        </div>

        {/* SBI BPCL Points */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">SBI BPCL Points</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Current Points Balance (starting balance)</label>
              <input type="number" value={form.startingPoints} onChange={e => set('startingPoints', e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-slate-200 focus:border-purple-400 rounded-xl text-sm outline-none" />
              <p className="text-xs text-slate-400 mt-1">Your points as of when you started tracking in this app. Future fills will be added on top.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Points per ₹100 spent</label>
                <input type="number" step="0.5" value={form.pointsPerHundred} onChange={e => set('pointsPerHundred', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-slate-200 focus:border-purple-400 rounded-xl text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">₹ value per point</label>
                <input type="number" step="0.01" value={form.valuePerPoint} onChange={e => set('valuePerPoint', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-slate-200 focus:border-purple-400 rounded-xl text-sm outline-none" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl px-4 py-3 text-sm text-purple-700">
              <strong>Current rate:</strong> {form.pointsPerHundred} pts / ₹100 · 1 pt = ₹{form.valuePerPoint}
              <br />
              <span className="text-xs text-purple-500 mt-0.5 block">Applies only to BPCL fills paid with SBI BPCL Card</span>
            </div>
          </div>
        </div>

        <button type="submit"
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all
            ${saved ? 'bg-green-500 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'}`}>
          {saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
