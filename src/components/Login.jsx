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
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left / Top — branding panel */}
      <div className="bg-slate-900 flex flex-col justify-center items-center px-10 py-14 md:w-1/2 md:min-h-screen">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-orange-500 w-11 h-11 rounded-xl flex items-center justify-center text-xl">⛽</div>
            <div>
              <p className="text-white font-bold text-lg leading-none">Fuel Tracker</p>
              <p className="text-slate-400 text-xs mt-0.5">Your personal fuel log</p>
            </div>
          </div>

          {/* USPs */}
          <div className="space-y-6">
            {[
              ['💸', 'Monthly spend visibility', 'Know exactly what fuel is costing you each month'],
              ['📈', 'Mileage trends', 'Track how your car is performing over time'],
              ['🎯', 'Reward points', 'Never miss out on points you have earned'],
              ['🔄', 'All your devices', 'Log on phone, review on laptop. Always in sync'],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex items-start gap-4">
                <div className="bg-slate-800 w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0">{icon}</div>
                <div>
                  <p className="text-white text-sm font-semibold">{title}</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right / Bottom — sign in panel */}
      <div className="flex flex-col justify-center items-center px-10 py-14 bg-white md:w-1/2 md:min-h-screen">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-10">Sign in to access your fuel logs</p>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-orange-400 hover:bg-orange-50 rounded-xl py-3.5 px-4 font-semibold text-slate-700 transition-all disabled:opacity-50">
            {loading ? (
              <span className="text-sm text-slate-500">Signing in...</span>
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

          <p className="text-xs text-slate-300 mt-10">Your data is private and only visible to you</p>
        </div>
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
