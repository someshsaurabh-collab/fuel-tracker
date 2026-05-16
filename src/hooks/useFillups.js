import { useState, useEffect } from 'react';

const FILLUPS_KEY = 'petrol_fillups';
const REDEMPTIONS_KEY = 'petrol_redemptions';
const SETTINGS_KEY = 'petrol_settings';

const DEFAULT_SETTINGS = {
  startingPoints: 0,
  pointsPerHundred: 13,
  valuePerPoint: 0.25,
  carName: 'Mahindra XUV 3XO AX5',
};

export function useFillups() {
  const [fillups, setFillups] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FILLUPS_KEY)) || []; }
    catch { return []; }
  });

  const [redemptions, setRedemptions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(REDEMPTIONS_KEY)) || []; }
    catch { return []; }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      return saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });

  useEffect(() => {
    localStorage.setItem(FILLUPS_KEY, JSON.stringify(fillups));
  }, [fillups]);

  useEffect(() => {
    localStorage.setItem(REDEMPTIONS_KEY, JSON.stringify(redemptions));
  }, [redemptions]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const addFillup = (entry) => {
    setFillups(prev => [...prev, entry]);
  };

  const updateFillup = (id, updated) => {
    setFillups(prev => prev.map(f => f.id === id ? { ...f, ...updated } : f));
  };

  const deleteFillup = (id) => {
    setFillups(prev => prev.filter(f => f.id !== id));
  };

  const addRedemption = (entry) => {
    setRedemptions(prev => [...prev, entry]);
  };

  const deleteRedemption = (id) => {
    setRedemptions(prev => prev.filter(r => r.id !== id));
  };

  const importFillups = (entries) => {
    setFillups(entries);
  };

  return {
    fillups,
    redemptions,
    settings,
    setSettings,
    addFillup,
    updateFillup,
    deleteFillup,
    addRedemption,
    deleteRedemption,
    importFillups,
  };
}
