import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Users, Mail, Lock, User, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getUsers, initializeData } from '../utils/localStorage';

const USERS_KEY = 'edutrack_users_v5';

const saveUser = (user) => {
  const all = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  all.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(all));
};

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [role,      setRole]      = useState('student');
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [focused,   setFocused]   = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors,    setErrors]    = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim())              e.name     = 'Full name is required';
    if (!email.trim())             e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password)                 e.password = 'Password is required';
    else if (password.length < 4)  e.password = 'Password must be at least 4 characters';
    if (password !== confirm)      e.confirm  = 'Passwords do not match';

    // Check email uniqueness
    const existing = getUsers().find(u => u.email?.toLowerCase() === email.trim().toLowerCase());
    if (existing)                  e.email    = 'This email is already registered';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      initializeData(); // ensure seed exists
      const newUser = {
        id:       `user_${Date.now()}`,
        name:     name.trim(),
        email:    email.trim().toLowerCase(),
        password: password,
        role:     role,
      };
      saveUser(newUser);
      login(newUser.id);
      toast.success(`Welcome, ${newUser.name.split(' ')[0]}! 🎉`);
      navigate(role === 'admin' ? '/admin' : '/student');
    }, 900);
  };

  const inputBase   = (field) => `relative transition-all rounded-2xl border ${
    errors[field]    ? 'ring-4 ring-rose-50 border-rose-200 bg-rose-50/20' :
    focused === field ? 'ring-4 ring-indigo-50 border-indigo-200 bg-white shadow-sm' :
    'bg-slate-50 border-slate-200'
  }`;

  return (
    <div className="min-h-screen bg-white font-outfit flex flex-col lg:flex-row overflow-hidden">

      {/* ── LEFT HERO ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-500/15 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <Link to="/" className="text-2xl font-serif font-black text-white tracking-tighter">
            eduTrack<span className="text-indigo-400">.</span>
          </Link>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <Sparkles size={10} className="animate-pulse" /> Join the Platform
          </div>
          <h2 className="text-5xl xl:text-6xl font-serif font-black text-white tracking-tight leading-tight mb-6">
            Start your<br />
            <span className="text-indigo-400 italic">journey.</span>
          </h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
            Create your account in seconds and immediately access your personalised dashboard.
          </p>

          <div className="mt-12 space-y-4">
            {[
              { icon: '🎓', text: 'Professor? Manage courses and assignments instantly.' },
              { icon: '📚', text: 'Student? Track your progress and submit with confidence.' },
              { icon: '🔒', text: 'Your data is stored securely in your browser.' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                <span className="text-xl">{item.icon}</span> {item.text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-600 text-xs font-bold uppercase tracking-widest">
          Already on eduTrack.
        </p>
      </div>

      {/* ── RIGHT FORM ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[480px]"
        >
          {/* Mobile brand */}
          <div className="lg:hidden mb-10 text-center">
            <Link to="/" className="text-2xl font-serif font-black text-slate-900 tracking-tighter">
              eduTrack<span className="text-indigo-500">.</span>
            </Link>
          </div>

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-indigo-100">
              <Zap size={10} /> Create Account
            </div>
            <h1 className="text-4xl font-serif font-black text-slate-900 tracking-tight">
              Sign Up
            </h1>
            <p className="text-slate-400 font-medium mt-2">
              Already have an account?{' '}
              <Link to="/" className="text-indigo-600 font-black hover:underline">Sign in →</Link>
            </p>
          </div>

          {/* Role Toggle */}
          <div className="relative flex bg-slate-100/60 rounded-[22px] p-1.5 mb-8 border border-slate-200/40">
            <motion.div
              layoutId="reg-role-bg"
              className="absolute inset-y-1.5 w-[calc(50%-6px)] rounded-[16px] bg-white shadow-sm border border-slate-100"
              style={{ left: role === 'student' ? '6px' : 'calc(50%)' }}
            />
            {[['student', GraduationCap, 'Student'], ['admin', Users, 'Instructor']].map(([r, Icon, label]) => (
              <button key={r} type="button"
                onClick={() => setRole(r)}
                className={`w-1/2 py-3 text-sm font-bold flex items-center justify-center gap-2 relative z-10 transition-all ${
                  role === r ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <div className={inputBase('name')}>
                <User size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'name' ? 'text-indigo-600' : 'text-slate-300'}`} />
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                  placeholder="Full Name"
                  className="w-full h-14 pl-12 pr-5 bg-transparent border-0 rounded-2xl outline-none text-slate-900 font-bold placeholder:text-slate-300"
                />
              </div>
              {errors.name && <p className="mt-1 ml-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <div className={inputBase('email')}>
                <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'email' ? 'text-indigo-600' : 'text-slate-300'}`} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  placeholder="Email Address"
                  className="w-full h-14 pl-12 pr-5 bg-transparent border-0 rounded-2xl outline-none text-slate-900 font-bold placeholder:text-slate-300"
                />
              </div>
              {errors.email && <p className="mt-1 ml-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className={inputBase('password')}>
                <Lock size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'password' ? 'text-indigo-600' : 'text-slate-300'}`} />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  placeholder="Password"
                  className="w-full h-14 pl-12 pr-5 bg-transparent border-0 rounded-2xl outline-none text-slate-900 font-bold placeholder:text-slate-300"
                />
              </div>
              {errors.password && <p className="mt-1 ml-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <div className={inputBase('confirm')}>
                <Lock size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'confirm' ? 'text-indigo-600' : 'text-slate-300'}`} />
                <input
                  type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                  placeholder="Confirm Password"
                  className="w-full h-14 pl-12 pr-5 bg-transparent border-0 rounded-2xl outline-none text-slate-900 font-bold placeholder:text-slate-300"
                />
              </div>
              {errors.confirm && <p className="mt-1 ml-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.confirm}</p>}
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={isLoading}
              className="w-full h-16 bg-indigo-600 hover:bg-slate-900 rounded-[20px] text-white font-black text-base shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-colors mt-2"
            >
              {isLoading
                ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Create Account</span> <ArrowRight size={20} /></>
              }
            </motion.button>
          </form>

          <p className="text-center text-slate-300 text-xs font-medium mt-8">
            By signing up you agree to the demo terms. All data is stored locally.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
