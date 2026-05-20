import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { calcPoints } from '../utils/calculations';

const CSV_HEADERS = 'date,odometer,litresFilled,pricePerLitre,totalAmount,tankType,station,paymentMethod';
const CSV_EXAMPLE = '2026-01-15,14200,38.5,95.72,3685.22,full,BPCL,SBI BPCL Card';

export default function ImportExport({ fillups, settings, onImport }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [imported, setImported] = useState(false);

  const handleExportCSV = () => {
    const rows = fillups.map(f =>
      [f.date, f.odometer, f.litresFilled, f.pricePerLitre, f.totalAmount,
        f.tankType, f.station, f.paymentMethod, f.pointsEarned || 0].join(',')
    );
    const csv = [CSV_HEADERS + ',pointsEarned', ...rows].join('\n');
    download('fuel-tracker-export.csv', csv, 'text/csv');
  };

  const handleExportJSON = () => {
    download('fuel-tracker-backup.json', JSON.stringify(fillups, null, 2), 'application/json');
  };

  const handleFileChange = (e) => {
    setError('');
    setPreview(null);
    setImported(false);
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result.trim();
        let entries;

        if (file.name.endsWith('.json')) {
          entries = JSON.parse(text);
          if (!Array.isArray(entries)) throw new Error('JSON must be an array');
        } else {
          const lines = text.split('\n').filter(Boolean);
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          entries = lines.slice(1).map(line => {
            const vals = line.split(',').map(v => v.trim());
            const obj = {};
            headers.forEach((h, i) => { obj[h] = vals[i]; });
            return {
              id: uuidv4(),
              date: obj.date,
              odometer: parseFloat(obj.odometer),
              litresFilled: parseFloat(obj.litresfilled || obj.litres),
              pricePerLitre: parseFloat(obj.priceperletre || obj.priceperliter || obj.priceperlire || obj.priceperlite || obj['price per litre'] || obj.priceperlitre),
              totalAmount: parseFloat(obj.totalamount || obj.total),
              tankType: (obj.tanktype || obj.tank || 'full').toLowerCase().includes('full') ? 'full' : 'partial',
              station: obj.station || 'BPCL',
              paymentMethod: obj.paymentmethod || obj.payment || 'SBI BPCL Card',
              pointsEarned: 0,
            };
          });
        }

        const valid = entries.filter(e => e.date && !isNaN(e.odometer) && !isNaN(e.litresFilled));
        setPreview(valid);
      } catch (err) {
        setError('Could not parse file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    onImport(preview);
    setImported(true);
    setPreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Export */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-slate-800 text-base mb-1">Export Your Data</h3>
        <p className="text-slate-400 text-sm mb-4">Download a backup of all your fill-up logs</p>
        <div className="flex gap-3">
          <button onClick={handleExportCSV}
            disabled={fillups.length === 0}
            className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-semibold transition-colors text-sm">
            📥 Export as CSV
          </button>
          <button onClick={handleExportJSON}
            disabled={fillups.length === 0}
            className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold transition-colors text-sm">
            📦 Export as JSON
          </button>
        </div>
        {fillups.length > 0 && (
          <p className="text-xs text-slate-400 mt-2 text-center">{fillups.length} entries will be exported</p>
        )}
      </div>

      {/* Import */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-slate-800 text-base mb-1">Import Data</h3>
        <p className="text-slate-400 text-sm mb-4">Upload a CSV or JSON file to bulk-load your old records</p>

        {/* CSV template */}
        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">CSV Format (required headers):</p>
          <code className="text-xs text-slate-600 block font-mono">{CSV_HEADERS}</code>
          <p className="text-xs font-semibold text-slate-600 mt-2 mb-1">Example row:</p>
          <code className="text-xs text-slate-500 block font-mono">{CSV_EXAMPLE}</code>
          <button onClick={() => download('fuel-tracker-template.csv', CSV_HEADERS + '\n' + CSV_EXAMPLE, 'text/csv')}
            className="mt-3 text-xs text-orange-600 hover:text-orange-700 font-semibold">
            ↓ Download template CSV
          </button>
        </div>

        <div
          onClick={() => fileRef.current.click()}
          className="border-2 border-dashed border-slate-200 hover:border-orange-300 rounded-xl p-8 text-center cursor-pointer transition-colors">
          <div className="text-3xl mb-2">📂</div>
          <p className="text-sm font-medium text-slate-600">Click to select file</p>
          <p className="text-xs text-slate-400 mt-1">CSV or JSON supported</p>
        </div>
        <input ref={fileRef} type="file" accept=".csv,.json" onChange={handleFileChange} className="hidden" />

        {error && (
          <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {imported && (
          <div className="mt-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
            ✓ Data imported successfully!
          </div>
        )}

        {preview && (
          <div className="mt-4 space-y-3">
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-orange-800">Preview — {preview.length} entries found</p>
              <p className="text-xs text-orange-600 mt-0.5">
                This will <strong>replace</strong> all existing data. Export first if you want to keep it.
              </p>
            </div>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    {['Date', 'Odometer', 'Litres', 'Price/L', 'Amount', 'Tank', 'Station'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-slate-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((e, i) => (
                    <tr key={i} className="border-t border-slate-50">
                      <td className="px-3 py-2">{e.date}</td>
                      <td className="px-3 py-2">{e.odometer}</td>
                      <td className="px-3 py-2">{e.litresFilled}L</td>
                      <td className="px-3 py-2">₹{e.pricePerLitre}</td>
                      <td className="px-3 py-2">₹{e.totalAmount}</td>
                      <td className="px-3 py-2">{e.tankType}</td>
                      <td className="px-3 py-2">{e.station}</td>
                    </tr>
                  ))}
                  {preview.length > 5 && (
                    <tr><td colSpan={7} className="px-3 py-2 text-slate-400 text-center">...and {preview.length - 5} more</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPreview(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium">Cancel</button>
              <button onClick={confirmImport}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-sm text-white font-semibold transition-colors">
                Confirm Import
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
