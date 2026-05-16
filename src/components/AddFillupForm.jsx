import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { calcPoints } from '../utils/calculations';

const today = () => new Date().toISOString().slice(0, 10);

export default function AddFillupForm({ settings, onAdd, onCancel, editData }) {
  const [form, setForm] = useState(editData || {
    date: today(),
    odometer: '',
    litresFilled: '',
    pricePerLitre: '',
    totalAmount: '',
    tankType: 'full',
    station: 'BPCL',
    paymentMethod: 'SBI BPCL Card',
  });
  const [amountOverridden, setAmountOverridden] = useState(!!editData);
  const [errors, setErrors] = useState({});

  const autoAmount = form.litresFilled && form.pricePerLitre
    ? parseFloat((parseFloat(form.litresFilled) * parseFloat(form.pricePerLitre)).toFixed(2))
    : '';

  const displayAmount = amountOverridden ? form.totalAmount : autoAmount;

  const pointsPreview = calcPoints(
    parseFloat(displayAmount) || 0,
    form.station,
    form.paymentMethod,
    settings.pointsPerHundred
  );

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.date) e.date = 'Required';
    if (!form.odometer || isNaN(form.odometer)) e.odometer = 'Enter valid km';
    if (!form.litresFilled || isNaN(form.litresFilled)) e.litresFilled = 'Enter litres';
    if (!form.pricePerLitre || isNaN(form.pricePerLitre)) e.pricePerLitre = 'Enter price';
    if (!displayAmount || isNaN(displayAmount)) e.totalAmount = 'Enter amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const finalAmount = parseFloat(displayAmount);
    const entry = {
      id: editData?.id || uuidv4(),
      date: form.date,
      odometer: parseFloat(form.odometer),
      litresFilled: parseFloat(form.litresFilled),
      pricePerLitre: parseFloat(form.pricePerLitre),
      totalAmount: finalAmount,
      tankType: form.tankType,
      station: form.station,
      paymentMethod: form.paymentMethod,
      pointsEarned: pointsPreview,
    };
    onAdd(entry);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-orange-500 px-6 py-4">
        <h2 className="text-white font-bold text-lg">{editData ? 'Edit Fill-up' : 'New Fill-up'}</h2>
        <p className="text-orange-100 text-sm">Log your petrol details</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Date" error={errors.date}>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
              className={input(errors.date)} />
          </Field>
          <Field label="Odometer Reading (km)" error={errors.odometer}>
            <input type="number" placeholder="e.g. 15240" value={form.odometer}
              onChange={e => set('odometer', e.target.value)}
              className={input(errors.odometer)} />
          </Field>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Litres Filled" error={errors.litresFilled}>
            <input type="number" step="0.01" placeholder="e.g. 38.5" value={form.litresFilled}
              onChange={e => set('litresFilled', e.target.value)}
              className={input(errors.litresFilled)} />
          </Field>
          <Field label="Price per Litre (₹)" error={errors.pricePerLitre}>
            <input type="number" step="0.01" placeholder="e.g. 95.72" value={form.pricePerLitre}
              onChange={e => set('pricePerLitre', e.target.value)}
              className={input(errors.pricePerLitre)} />
          </Field>
          <Field label="Total Amount (₹)" error={errors.totalAmount}>
            <div className="relative">
              <input type="number" step="0.01"
                value={amountOverridden ? form.totalAmount : (autoAmount || '')}
                placeholder={autoAmount ? String(autoAmount) : 'Auto-calculated'}
                onChange={e => { setAmountOverridden(true); set('totalAmount', e.target.value); }}
                className={input(errors.totalAmount) + ' pr-20'} />
              {amountOverridden && (
                <button type="button"
                  onClick={() => { setAmountOverridden(false); set('totalAmount', ''); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-orange-500 hover:text-orange-700 font-medium">
                  Reset
                </button>
              )}
            </div>
            {!amountOverridden && autoAmount && (
              <p className="text-xs text-slate-400 mt-1">Auto: ₹{autoAmount} · tap to override</p>
            )}
          </Field>
        </div>

        {/* Tank type */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">Tank Fill Type</label>
          <div className="flex gap-3">
            {['full', 'partial'].map(t => (
              <button key={t} type="button"
                onClick={() => set('tankType', t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all capitalize
                  ${form.tankType === t
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                {t === 'full' ? '⛽ Full Tank' : '🔋 Partial'}
              </button>
            ))}
          </div>
          {form.tankType === 'partial' && (
            <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-2 rounded-lg">
              Mileage won't be calculated for partial fills. Expense tracking still works.
            </p>
          )}
        </div>

        {/* Station & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Petrol Station</label>
            <div className="flex gap-2">
              {['BPCL', 'Other'].map(s => (
                <button key={s} type="button"
                  onClick={() => set('station', s)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                    ${form.station === s
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  {s === 'BPCL' ? '🔵 BPCL' : '⚪ Other'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Payment Method</label>
            <div className="flex gap-2">
              {['SBI BPCL Card', 'Other', 'Cash'].map(p => (
                <button key={p} type="button"
                  onClick={() => set('paymentMethod', p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all
                    ${form.paymentMethod === p
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  {p === 'SBI BPCL Card' ? '💳 SBI BPCL' : p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Points Preview */}
        <div className={`rounded-xl px-4 py-3 flex items-center justify-between
          ${pointsPreview > 0 ? 'bg-purple-50 border border-purple-100' : 'bg-slate-50 border border-slate-100'}`}>
          <div>
            <p className="text-sm font-semibold text-slate-700">Points to be earned</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {pointsPreview > 0
                ? `₹${parseFloat(displayAmount).toFixed(0)} ÷ 100 × ${settings.pointsPerHundred} pts`
                : 'Only at BPCL with SBI BPCL Card'}
            </p>
          </div>
          <div className={`text-xl font-bold ${pointsPreview > 0 ? 'text-purple-700' : 'text-slate-400'}`}>
            {pointsPreview > 0 ? `+${pointsPreview}` : '0'} pts
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:border-slate-300 transition-colors">
            Cancel
          </button>
          <button type="submit"
            className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-sm">
            {editData ? 'Update Fill-up' : 'Save Fill-up'}
          </button>
        </div>
      </form>
    </div>
  );
}

const input = (err) =>
  `w-full px-3 py-2.5 rounded-xl border-2 text-sm transition-colors outline-none
  ${err ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-orange-400 bg-white'}`;

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
