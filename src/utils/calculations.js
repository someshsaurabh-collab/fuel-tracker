// Returns mileage (km/l) for a fill-up given the sorted full list of fillups
// Only calculated between consecutive full-tank fills
export function getMileage(fillup, allFillups) {
  if (fillup.tankType !== 'full') return null;

  const sorted = [...allFillups].sort((a, b) => new Date(a.date) - new Date(b.date));
  const idx = sorted.findIndex(f => f.id === fillup.id);
  if (idx <= 0) return null;

  // Find the most recent full tank fill before this one
  let prevFullIdx = -1;
  for (let i = idx - 1; i >= 0; i--) {
    if (sorted[i].tankType === 'full') {
      prevFullIdx = i;
      break;
    }
  }
  if (prevFullIdx === -1) return null;

  const kmDriven = fillup.odometer - sorted[prevFullIdx].odometer;
  if (kmDriven <= 0) return null;

  // Sum litres for all fills between prevFull and this fill (inclusive of partials in between)
  let totalLitres = 0;
  for (let i = prevFullIdx + 1; i <= idx; i++) {
    totalLitres += sorted[i].litresFilled;
  }

  return parseFloat((kmDriven / totalLitres).toFixed(2));
}

export function getKmDriven(fillup, allFillups) {
  const sorted = [...allFillups].sort((a, b) => new Date(a.date) - new Date(b.date));
  const idx = sorted.findIndex(f => f.id === fillup.id);
  if (idx <= 0) return null;
  const kmDriven = fillup.odometer - sorted[idx - 1].odometer;
  return kmDriven > 0 ? kmDriven : null;
}

export function groupByMonth(fillups) {
  const map = {};
  fillups.forEach(f => {
    const key = f.date.slice(0, 7); // YYYY-MM
    if (!map[key]) map[key] = { month: key, totalAmount: 0, litres: 0, fills: 0, pointsEarned: 0 };
    map[key].totalAmount += f.totalAmount;
    map[key].litres += f.litresFilled;
    map[key].fills += 1;
    map[key].pointsEarned += f.pointsEarned || 0;
  });
  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
}

export function formatMonth(yyyymm) {
  const [y, m] = yyyymm.split('-');
  return new Date(y, m - 1).toLocaleString('en-IN', { month: 'short', year: 'numeric' });
}

export function calcPoints(totalAmount, station, payment, ratePerHundred) {
  if (station === 'BPCL' && payment === 'SBI BPCL Card') {
    return Math.floor(totalAmount / 100) * ratePerHundred;
  }
  return 0;
}

export function pointsToRupees(points, valuePerPoint) {
  return parseFloat((points * valuePerPoint).toFixed(2));
}
