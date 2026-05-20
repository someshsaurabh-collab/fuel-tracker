import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (e) {
      setError('Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-sm text-center">
        <div className="bg-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
          ⛽
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Fuel Tracker</h1>
        <p className="text-slate-400 text-sm mb-6 mt-1">Your personal fuel log</p>
        <div className="text-left space-y-2 mb-8 w-full">
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <span className="text-base">📍</span> Know exactly what you spend on fuel every month
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <span className="text-base">📈</span> Watch your mileage trend over time
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <span className="text-base">🎯</span> Never lose track of your reward points
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <span className="text-base">📱</span> Works on your phone and laptop both
          </div>
        </div>

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-slate-300 rounded-xl py-3 px-4 font-semibold text-slate-700 transition-all disabled:opacity-50">
          {loading ? (
            <span className="text-sm">Signing in...</span>
          ) : (
            <>
              <GoogleIcon />
              <span className="text-sm">Continue with Google</span>
            </>
          )}
        </button>

        {error && (
          <p className="text-red-500 text-xs mt-3">{error}</p>
        )}

        <p className="text-xs text-slate-300 mt-6">Your data is private and only visible to you</p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9s.348 2.826.957 4.038l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
