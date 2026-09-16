import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  KeyRound,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Fingerprint,
  Building2,
  Cpu,
  AlertCircle
} from 'lucide-react';
import { useThreat } from '../context/ThreatContext';

export const Login = () => {
  const navigate = useNavigate();
  const { setActiveUser } = useThreat();

  const [authMode, setAuthMode] = useState('sso'); // 'sso' | 'credentials' | 'pki'
  const [email, setEmail] = useState('evaluator.sih2026@gov-cyber.in');
  const [password, setPassword] = useState('••••••••••••');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaStep, setMfaStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = (role) => {
    setIsLoading(true);
    setTimeout(() => {
      if (role === 'evaluator') {
        setActiveUser({
          name: 'SIH 2026 Evaluator',
          role: 'Grand Jury & Cybersecurity Evaluator',
          organization: 'Smart India Hackathon 2026 / MoE',
          avatar: 'SIH',
          badge: 'SIH 2026 Jury Access'
        });
      } else if (role === 'soc') {
        setActiveUser({
          name: 'Vikram Mehta',
          role: 'Lead Threat Hunter & Incident Responder',
          organization: 'National Cyber Coordination Centre (NCCC)',
          avatar: 'VM',
          badge: 'SOC Level 3 Clearance'
        });
      } else {
        setActiveUser({
          name: 'Dr. Rajesh Sharma',
          role: 'Chief Information Security Officer (CISO)',
          organization: 'Defense Cyber Agency (DCA)',
          avatar: 'RS',
          badge: 'Executive CISO Access'
        });
      }
      setIsLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mfaStep) {
      setMfaStep(true);
      return;
    }
    handleDemoLogin('soc');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#070b14]">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full max-h-[800px] pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.15) 0%, transparent 70%)'
        }}
      />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10">
        {/* Left Column: Branding & Platform Intel */}
        <div className="md:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Smart India Hackathon 2026 Edition</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              PhishGuard <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">AI</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Next-generation email threat intelligence, SMTP protocol forensics, hop geolocation, and business email compromise defense platform for national and enterprise SOC teams.
            </p>
          </div>

          {/* Value Props */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>RFC 5322 Deep Header & SMTP Hop Chronology Analysis</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Automated GeoTrace Vector Map with TOR / VPN Detection</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Domain Intelligence, Lookalike Scoring & Case Management</span>
            </div>
          </div>

          {/* Quick Demo Login Bar for SIH Evaluator */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-cyan-950/40 border border-cyan-500/30 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Evaluator & SOC Personas</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Instant Access</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoLogin('evaluator')}
                className="px-2.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-[11px] font-semibold text-blue-200 transition-all text-center"
              >
                SIH Evaluator
              </button>
              <button
                onClick={() => handleDemoLogin('soc')}
                className="px-2.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-[11px] font-semibold text-cyan-200 transition-all text-center"
              >
                SOC Hunter
              </button>
              <button
                onClick={() => handleDemoLogin('ciso')}
                className="px-2.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-[11px] font-semibold text-purple-200 transition-all text-center"
              >
                CISO Executive
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Glassmorphic Login Form */}
        <div className="md:col-span-6">
          <div className="p-8 rounded-[24px] bg-slate-900/70 backdrop-blur-2xl border border-slate-700/80 shadow-2xl relative">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Authentication</h2>
              <p className="text-xs text-slate-400 mt-1">Sign in with government or enterprise security credentials</p>
            </div>

            {/* Auth Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 mb-5">
              <button
                type="button"
                onClick={() => setAuthMode('sso')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'sso' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Gov / Entra SSO
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('credentials')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'credentials' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Password + MFA
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('pki')}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'pki' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Smart Card / PKI
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!mfaStep ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                      GOVERNMENT / ENTERPRISE EMAIL ID
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                        placeholder="officer@nic.in"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-slate-300 font-mono">
                        SECURITY MASTER KEY
                      </label>
                      <a href="#reset" onClick={(e) => e.preventDefault()} className="text-[11px] text-cyan-400 hover:underline">
                        Forgot Key?
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold font-mono">
                    <Fingerprint className="w-4 h-4" />
                    <span>FIDO2 / KAVACH 2FA VERIFICATION</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Enter the 6-digit TOTP token generated on your government Kavach authenticator application.
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="994 218"
                    className="w-full text-center tracking-widest text-lg font-mono font-bold px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 focus:outline-none focus:border-cyan-400"
                    autoFocus
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating Identity...</span>
                ) : !mfaStep ? (
                  <>
                    <span>Proceed to 2FA Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize SOC Command Session</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-400" />
                TLS 1.3 Strict & ISO 27001
              </span>
              <span>CERT-In Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
