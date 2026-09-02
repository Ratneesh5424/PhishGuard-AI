import React from 'react';
import Button from '../components/Button';

export const Settings = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400">Configure AI model parameters and alert rules</p>
      </div>

      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <h2 className="text-lg font-semibold text-white">Detection Preferences</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0" />
            <span className="text-sm text-slate-300">Enable Deep URL Sandboxing</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0" />
            <span className="text-sm text-slate-300">Enable NLP Phishing Urgency Detection</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0" />
            <span className="text-sm text-slate-300">Auto-quarantine flagged attachments</span>
          </label>
        </div>
        <div className="pt-4">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2">
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
