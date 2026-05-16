import { useState, useEffect } from 'react';
import {
  collection, doc, onSnapshot, setDoc, deleteDoc, writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULT_SETTINGS = {
  startingPoints: 0,
  pointsPerHundred: 13,
  valuePerPoint: 0.25,
  carName: 'Mahindra XUV 3XO AX5',
};

export function useFillups(uid) {
  const [fillups, setFillups] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fillupsRef = () => collection(db, 'users', uid, 'fillups');
  const redemptionsRef = () => collection(db, 'users', uid, 'redemptions');
  const settingsDocRef = () => doc(db, 'users', uid, 'meta', 'settings');

  useEffect(() => {
    if (!uid) return;
    let settled = 0;
    const done = () => { settled++; if (settled === 3) setLoading(false); };

    const unsubFillups = onSnapshot(fillupsRef(), snap => {
      setFillups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      done();
    });

    const unsubRedemptions = onSnapshot(redemptionsRef(), snap => {
      setRedemptions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      done();
    });

    const unsubSettings = onSnapshot(settingsDocRef(), snap => {
      if (snap.exists()) setSettingsState({ ...DEFAULT_SETTINGS, ...snap.data() });
      done();
    });

    return () => { unsubFillups(); unsubRedemptions(); unsubSettings(); };
  }, [uid]);

  const addFillup = (entry) =>
    setDoc(doc(db, 'users', uid, 'fillups', entry.id), entry);

  const updateFillup = (id, updated) =>
    setDoc(doc(db, 'users', uid, 'fillups', id), updated);

  const deleteFillup = (id) =>
    deleteDoc(doc(db, 'users', uid, 'fillups', id));

  const addRedemption = (entry) =>
    setDoc(doc(db, 'users', uid, 'redemptions', entry.id), entry);

  const deleteRedemption = (id) =>
    deleteDoc(doc(db, 'users', uid, 'redemptions', id));

  const setSettings = (newSettings) =>
    setDoc(settingsDocRef(), newSettings);

  const importFillups = async (entries) => {
    const batch = writeBatch(db);
    // Delete existing
    fillups.forEach(f => batch.delete(doc(db, 'users', uid, 'fillups', f.id)));
    // Add new
    entries.forEach(e => batch.set(doc(db, 'users', uid, 'fillups', e.id), e));
    await batch.commit();
  };

  return {
    fillups, redemptions, settings, loading,
    setSettings, addFillup, updateFillup, deleteFillup,
    addRedemption, deleteRedemption, importFillups,
  };
}
