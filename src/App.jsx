import { useState } from 'react';
import { useFillups } from './hooks/useFillups';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import AddFillupForm from './components/AddFillupForm';
import LogsTable from './components/LogsTable';
import Analytics from './components/Analytics';
import PointsTracker from './components/PointsTracker';
import ImportExport from './components/ImportExport';
import Settings from './components/Settings';
import Login from './components/Login';
import './index.css';

const NAV = [
  { id: 'dashboard', label: 'Home', icon: '🏠' },
  { id: 'logs', label: 'Logs', icon: '📋' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'points', label: 'Points', icon: '🎯' },
  { id: 'import', label: 'Import/Export', icon: '📁' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function App() {
  const { user } = useAuth();

  // Show loading spinner while auth state resolves
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  // Not signed in — show login screen
  if (!user) return <Login />;

  return <AppShell user={user} />;
}

function AppShell({ user }) {
  const [page, setPage] = useState('dashboard');
  const [editEntry, setEditEntry] = useState(null);
  const {
    fillups, redemptions, settings, loading, setSettings,
    addFillup, updateFillup, deleteFillup,
    addRedemption, deleteRedemption, importFillups,
  } = useFillups(user.uid);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading your data...</div>
      </div>
    );
  }

  const handleAdd = (entry) => {
    if (editEntry) {
      updateFillup(entry.id, entry);
      setEditEntry(null);
    } else {
      addFillup(entry);
    }
    setPage('logs');
  };

  const handleEdit = (entry) => {
    setEditEntry(entry);
    setPage('add');
  };

  const handleCancel = () => {
    setEditEntry(null);
    setPage(editEntry ? 'logs' : 'dashboard');
  };

  const showAdd = page === 'add';

  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-orange-500 rounded-xl w-8 h-8 flex items-center justify-center text-white text-sm font-bold">⛽</div>
            <div>
              <span className="font-bold text-slate-800 text-sm">Fuel Tracker</span>
              <span className="text-slate-400 text-xs block leading-none">{settings.carName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditEntry(null); setPage('add'); }}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
              + Add
            </button>
            <div className="flex items-center gap-2 pl-1 border-l border-slate-100 ml-1">
              {user.photoURL
                ? <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border-2 border-slate-100" />
                : <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center">
                    {user.displayName?.[0] || 'U'}
                  </div>
              }
              <button
                onClick={logout}
                title="Sign out"
                className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors hidden sm:block">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {showAdd && (
          <AddFillupForm
            settings={settings}
            onAdd={handleAdd}
            onCancel={handleCancel}
            editData={editEntry}
          />
        )}
        {!showAdd && page === 'dashboard' && (
          <Dashboard
            fillups={fillups}
            redemptions={redemptions}
            settings={settings}
            onNavigate={setPage}
          />
        )}
        {!showAdd && page === 'logs' && (
          <LogsTable fillups={fillups} onEdit={handleEdit} onDelete={deleteFillup} />
        )}
        {!showAdd && page === 'analytics' && (
          <Analytics fillups={fillups} />
        )}
        {!showAdd && page === 'points' && (
          <PointsTracker
            fillups={fillups}
            redemptions={redemptions}
            settings={settings}
            onAddRedemption={addRedemption}
            onDeleteRedemption={deleteRedemption}
          />
        )}
        {!showAdd && page === 'import' && (
          <ImportExport fillups={fillups} settings={settings} onImport={importFillups} />
        )}
        {!showAdd && page === 'settings' && (
          <Settings settings={settings} onSave={setSettings} />
        )}
      </main>

      {/* Bottom nav */}
      <nav className="bg-white border-t border-slate-100 sticky bottom-0 z-20 shadow-lg">
        <div className="max-w-4xl mx-auto px-2 flex">
          {NAV.map(n => (
            <button key={n.id}
              onClick={() => { setEditEntry(null); setPage(n.id); }}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors
                ${page === n.id && !showAdd
                  ? 'text-orange-500'
                  : 'text-slate-400 hover:text-slate-600'}`}>
              <span className="text-lg leading-none">{n.icon}</span>
              <span className="text-xs font-medium">{n.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
