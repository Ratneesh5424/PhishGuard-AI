import React from 'react';
import Button from '../components/Button';

export const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md p-8 rounded-2xl border border-slate-800 bg-slate-900/60">
        <h1 className="text-2xl font-bold text-white text-center mb-2">PhishGuard AI</h1>
        <p className="text-sm text-slate-400 text-center mb-6">Sign in to your account</p>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="user@example.com"
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
