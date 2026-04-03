import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers } from '../utils/localStorage';
import {
  GraduationCap, ArrowRight, Lock, Mail, Users, UserCircle2,
  BookOpen, BarChart3, ShieldCheck,
  Sparkles, Zap, ChevronRight, Play, CheckCircle2,
  Globe, Clock, Smartphone, Terminal, Database, Layout, Layers, Fingerprint, Activity, Rocket, Hammer
} from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

/* ─── COMPONENTS ─── */

const SectionTitle = ({ subtitle, title, description, centered = false }) => (
  <div className={`mb-12 ${centered ? 'text-center max-w-2xl mx-auto' : ''}`}>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm border border-indigo-100"
    >
      <Zap size={10} /> {subtitle}
    </motion.div>
    <h2 className={`text-4xl md:text-5xl font-serif font-black text-slate-900 mb-6 tracking-tight leading-tight`}>
      {title}
    </h2>
    {description && (
      <p className={`text-slate-500 text-lg font-medium leading-relaxed italic ${centered ? 'border-none pl-0' : 'border-l-2 border-indigo-100 pl-4'} py-1`}>
        {description}
      </p>
    )}
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc, colorClass }) => (
  <motion.div
    whileHover={{ y: -8 }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group"
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-50 transition-transform group-hover:scale-110 group-hover:rotate-3 ${colorClass}`}>
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-3">{desc}</p>
  </motion.div>
);

const StatPill = ({ icon, value, label, delay, className, style }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    className={`absolute flex items-center gap-2.5 px-4 py-2.5 rounded-2xl
      bg-white/95 backdrop-blur-md border border-slate-100/80
      shadow-xl shadow-slate-200/40 animate-float ${className}`}
    style={style}
  >
    <div className="text-indigo-600">{icon}</div>
    <div>
      <p className="text-slate-900 font-black text-sm leading-none tracking-tight">{value}</p>
      <p className="text-slate-400 text-[10px] mt-0.5 font-bold uppercase tracking-wider">{label}</p>
    </div>
  </motion.div>
);

/* ─── MAIN COMPONENT ─── */

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollYProgress } = useScroll();
  const letterOpacity = useTransform(scrollYProgress, [0, 0.2], [0.4, 0.1]);
  const letterScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const executeLogin = (overrideEmail, overridePassword) => {
    const loginEmail    = (overrideEmail    ?? email).trim().toLowerCase();
    const loginPassword = (overridePassword ?? password).trim();

    if (!loginEmail || !loginPassword) {
      toast.error('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Always read fresh from localStorage so newly registered users are found
      const matched = getUsers().find(
        u => u.email?.toLowerCase() === loginEmail && u.password === loginPassword
      );
      if (matched) {
        login(matched.id);
        toast.success(`Welcome back, ${matched.name}! 👋`);
        navigate(matched.role === 'admin' ? '/admin' : '/student');
      } else {
        toast.error('Invalid email or password. Try one of the demo credentials below.');
        setIsLoading(false);
      }
    }, 900);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeLogin();
  };

  const quickAccess = (role, demoEmail, demoPass) => {
    setActiveTab(role);
    setEmail(demoEmail);
    setPassword(demoPass);
    executeLogin(demoEmail, demoPass);
  };

  return (
    <div className="bg-white font-outfit relative select-none uppercase-none">

      {/* ─── STICKY NAVIGATION ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 md:px-12 py-4 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100 py-3 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="text-slate-900 font-serif font-black text-2xl tracking-tighter">eduTrack<span className="text-indigo-500">.</span></span>
          </div>
          <div className="hidden md:flex items-center gap-12">
            <a href="#features" className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors">Core Architecture</a>
            <a href="#instructors" className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors">Instructor Hub</a>
            <a href="#students" className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors">Student Portal</a>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">Launch Demo</button>
          </div>
        </div>
      </nav>

      {/* ─── SECTION 1: HERO & LOGIN ─── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden pt-20">

        {/* Background Graphic */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div
            style={{ opacity: letterOpacity, scale: letterScale }}
            className="absolute top-[10%] right-[-5%] text-[50rem] font-serif font-black text-slate-100 leading-none"
          >
            E
          </motion.div>
          <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-indigo-50 rounded-full blur-[120px] opacity-70 animate-blob" />
          <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="w-full max-w-7xl mx-auto flex flex-1 items-center relative z-10 px-6 md:px-12">
          <div className="w-full lg:flex items-center justify-between gap-16">

            {/* Hero Text */}
            <div className="lg:w-1/2 mb-16 lg:mb-0">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full bg-white shadow-sm border border-slate-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Sparkles size={12} className="animate-pulse" /> THE ASSIGNMENT & REVIEW DASHBOARD
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-7xl xl:text-8xl font-serif font-black leading-tight text-slate-900 tracking-tight mb-8">
                  The ultimate<br />
                  <span className="relative">
                    management{' '}
                    <svg className="absolute -bottom-2 left-0 w-full h-4 text-indigo-100/60" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                      <path d="M2.5 9.5C40.5 4.5 120.5 1.5 197.5 9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <span className="relative z-10 text-indigo-600 italic"> dashboard.</span>
                  </span>
                </h1>

                <p className="text-slate-500 text-xl font-medium max-w-md leading-relaxed mb-10 border-l-4 border-indigo-100 pl-6">
                  Manage assignments, attach external assets, and track student progress in one clean, unified dashboard with full role-based access.
                </p>

                <div className="flex flex-wrap gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-slate-400 text-sm font-medium self-center">
                    Trusted by <span className="text-slate-900 font-bold underline decoration-indigo-200 decoration-2">2,000+ Instructors</span> worldwide
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Login Card */}
            <div className="lg:w-auto flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full max-w-[440px]"
              >
                <div className="bg-white/80 backdrop-blur-[40px] border border-white shadow-[0_32px_120px_-20px_rgba(0,0,0,0.12)] rounded-[32px] p-8 sm:p-11 relative overflow-hidden">
                  <div className="text-center mb-10">
                    <div className="font-script text-indigo-500 text-2xl mb-1 flex items-center justify-center gap-2">Internal Evaluation Mode <span className="animate-bounce">🛠️</span></div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Enter Dashboard</h2>
                    <p className="text-slate-400 text-sm font-medium mt-2">
                      New here?{' '}
                      <Link to="/register" className="text-indigo-600 font-black hover:underline">Create an account →</Link>
                    </p>
                  </div>

                  <div className="relative flex bg-slate-100/60 rounded-[22px] p-1.5 mb-8 border border-slate-200/40">
                    <motion.div
                      layoutId="role-bg"
                      className="absolute inset-y-1.5 w-[calc(50%-6px)] rounded-[16px] bg-white shadow-sm border border-slate-100"
                      style={{ left: activeTab === 'student' ? '6px' : 'calc(50%)' }}
                    />
                    {[['student', GraduationCap, 'Student'], ['admin', Users, 'Instructor']].map(([role, Icon, label]) => (
                      <button key={role} onClick={() => setActiveTab(role)} className={`w-1/2 py-3 text-sm font-bold flex items-center justify-center gap-2 relative z-10 transition-all ${activeTab === role ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                        <Icon size={16} /> {label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className={`relative transition-all rounded-2xl group ${focused === 'email' ? 'ring-4 ring-indigo-50 border-indigo-200 bg-white' : 'bg-slate-50 border-slate-200'}`}>
                      <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'email' ? 'text-indigo-600' : 'text-slate-300'}`} />
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} placeholder="e.g. alice@edu.com" className="w-full h-14 pl-12 pr-5 bg-transparent border-0 rounded-2xl outline-none text-slate-900 font-bold" />
                    </div>
                    <div className={`relative transition-all rounded-2xl group ${focused === 'pass' ? 'ring-4 ring-indigo-50 border-indigo-200 bg-white' : 'bg-slate-50 border-slate-200'}`}>
                      <Lock size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === 'pass' ? 'text-indigo-600' : 'text-slate-300'}`} />
                      <input type="password" required value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)} placeholder="••••••••" className="w-full h-14 pl-12 pr-5 bg-transparent border-0 rounded-2xl outline-none text-slate-900 font-bold" />
                    </div>
                    <motion.button whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.98 }} disabled={isLoading} className="w-full h-16 bg-indigo-600 rounded-[20px] text-white font-black text-lg shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3">
                      {isLoading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <>Access Dashboard <ArrowRight size={22} /></>}
                    </motion.button>
                  </form>
                  {/* Credentials Hint */}
                  <div className="mt-8 space-y-3">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-center">Quick Access — Click to autofill</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => quickAccess('student', 'alice@edu.com', 'pass')}
                        className="h-11 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 text-[10px] font-black uppercase text-indigo-600 tracking-widest transition-all flex flex-col items-center justify-center gap-0.5"
                      >
                        <span>Alice</span><span className="text-[8px] text-indigo-400 normal-case font-bold">alice@edu.com</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => quickAccess('student', 'bob@edu.com', 'pass')}
                        className="h-11 rounded-xl border border-sky-100 bg-sky-50/30 hover:bg-sky-50 text-[10px] font-black uppercase text-sky-600 tracking-widest transition-all flex flex-col items-center justify-center gap-0.5"
                      >
                        <span>Bob</span><span className="text-[8px] text-sky-400 normal-case font-bold">bob@edu.com</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => quickAccess('student', 'charlie@edu.com', 'pass')}
                        className="h-11 rounded-xl border border-violet-100 bg-violet-50/30 hover:bg-violet-50 text-[10px] font-black uppercase text-violet-600 tracking-widest transition-all flex flex-col items-center justify-center gap-0.5"
                      >
                        <span>Charlie</span><span className="text-[8px] text-violet-400 normal-case font-bold">charlie@edu.com</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => quickAccess('admin', 'dr.smith@edu.com', 'pass')}
                        className="h-11 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-[10px] font-black uppercase text-slate-600 tracking-widest transition-all flex flex-col items-center justify-center gap-0.5"
                      >
                        <span>Dr. Smith</span><span className="text-[8px] text-slate-400 normal-case font-bold">dr.smith@edu.com</span>
                      </button>
                    </div>
                    <p className="text-center text-[10px] text-slate-300 font-bold">All passwords: <span className="font-black text-slate-400">pass</span></p>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>

        {/* Scroll Indicator (Centered) */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-bold">Discover More</span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-indigo-500 to-transparent" />
        </motion.div>
      </section>

      {/* ─── SECTION 2: FOR INSTRUCTORS ─── */}
      <section id="instructors" className="py-24 md:py-40 relative bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="lg:flex items-center gap-20">
            <div className="lg:w-1/2 mb-16 lg:mb-0">
              <SectionTitle
                subtitle="Instructor Console"
                title="Admins: Create, Manage, and Visualize."
                description="Designed for professors to broadcast tasks and track real-time results with high-fidelity visual progress bars."
              />
              <div className="space-y-6">
                {[
                  { t: "Dynamic Task Creation", d: "Attach Drive links and reference material for a seamless student experience." },
                  { t: "Visual Progress Indicators", d: "Identify individual student completion status at a glance with live analytics." },
                  { t: "Unified Analytics Hub", d: "One source of truth for every assignment you create and every student you manage." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <CheckCircle2 className="text-indigo-600 shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-slate-900">{item.t}</h4>
                      <p className="text-slate-500 text-sm font-medium">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative group">
              <div className="bg-white rounded-[40px] p-2 md:p-4 shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                <div className="flex gap-1.5 mb-4 pl-4 pt-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-100" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-100" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-100" />
                </div>
                <div className="aspect-[16/10] rounded-[24px] overflow-hidden relative shadow-inner">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 1 }}
                    src="/instructor_analytics.png"
                    alt="Instructor Analytics Mockup"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center pointer-events-none">
                    {/* Icon removed for cleaner look */}
                  </div>
                  <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none">
                    <div className="h-6 w-32 bg-white/40 backdrop-blur-md rounded-full border border-white/10" />
                    <div className="h-6 w-12 bg-indigo-500/20 backdrop-blur-md rounded-full border border-white/10" />
                  </div>
                </div>
              </div>
              <StatPill icon={<Activity size={18} />} value="92%" label="Class Completion" delay={1.2} className="-bottom-6 -left-6 z-20 scale-110 !shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: FOR STUDENTS ─── */}
      <section id="students" className="py-24 md:py-40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="lg:flex flex-row-reverse items-center gap-24">
            <div className="lg:w-1/2 mb-16 lg:mb-0">
              <SectionTitle
                subtitle="Student Experience"
                title="Students: Focus, Submit, and Confirm."
                description="Featuring a built-in double-verification flow to ensure every submission is intentional, verified, and logged."
              />
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100/50 shadow-sm">
                  <div className="font-serif text-3xl font-black text-indigo-600 mb-2 tracking-tighter">01.</div>
                  <h5 className="font-bold text-slate-900 mb-1">Double-Verify Flow</h5>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Two-Step Safety Net</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100/50 shadow-sm">
                  <div className="font-serif text-3xl font-black text-rose-600 mb-2 tracking-tighter">02.</div>
                  <h5 className="font-bold text-slate-900 mb-1">State Persistence</h5>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">LocalStorage Powered</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="bg-slate-900 rounded-[40px] aspect-[4/5] p-12 flex flex-col justify-end text-white overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <StatPill icon={<Rocket size={18} />} value="Task Done!" label="State Updated" delay={0.5} className="top-12 left-12" />
                <h3 className="text-5xl font-serif font-black mb-6 tracking-tight leading-none">Simplified tracking.</h3>
                <p className="text-slate-400 text-lg font-medium leading-relaxed italic">The ultimate tracker for the modern learner. Never miss a deadline and see your growth in real-time.</p>
              </div>
              {/* Floating Hand-drawn arrow accent */}
              <div className="absolute -top-12 -right-8 hidden xl:block opacity-20">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="rotate-[160deg]">
                  <path d="M10 10C30 50 80 70 110 40M110 40L95 35M110 40L105 55" stroke="#6366f1" strokeWidth="4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: FEATURE MATRIX ─── */}
      <section id="features" className="py-24 md:py-40 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <SectionTitle
            centered
            subtitle="The Architecture"
            title="Modern Tech, Masterful Logic."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { i: Globe, c: "text-indigo-600 bg-indigo-50", t: "Drive Link Integration", d: "Seamlessly attach external cloud assets to any assignment you create for student reference." },
              { i: Smartphone, c: "text-sky-600 bg-sky-50", t: "Full Responsiveness", d: "Engineered with Tailwind CSS to provide a perfect dashboard experience on desktop, tablet, and mobile." },
              { i: ShieldCheck, c: "text-emerald-600 bg-emerald-50", t: "Role-Based Access", d: "Clean architecture isolating data between Student and Instructor experiences." },
              { i: Layout, c: "text-rose-600 bg-rose-50", t: "Progress Visualization", d: "Interactive visual bars showing the submission status for every student in the cohort." },
              { i: Zap, c: "text-amber-600 bg-amber-50", t: "Client-Side State", d: "Zero-latency performance powered by persistent LocalStorage for a full-stack feel." },
              { i: Sparkles, c: "text-violet-600 bg-violet-50", t: "Creative UX Focus", d: "A dashboard designed for students, by artists. Clean, readable, and highly interactive." }
            ].map((feat, i) => (
              <FeatureCard key={i} icon={feat.i} title={feat.t} desc={feat.d} colorClass={feat.c} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: FINAL CTA ─── */}
      <section className="py-32 md:py-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <SectionTitle
            centered
            subtitle="Begin Your Journey"
            title="Ready to transform your classroom?"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-10 py-5 bg-slate-900 text-white font-black text-xl rounded-2xl shadow-2xl shadow-indigo-200/50 flex items-center gap-3 mx-auto"
          >
            Run Project Demo <ArrowRight size={24} />
          </motion.button>
          <p className="mt-8 text-slate-400 text-sm font-bold uppercase tracking-[0.3em] italic border-b border-indigo-100 inline-block pb-1">Designed & Developed by Aditya</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div>
              <div className="flex items-center gap-3 justify-center md:justify-start mb-6">
                <span className="text-slate-900 font-serif font-black text-2xl tracking-tighter underline underline-offset-4 decoration-indigo-200 decoration-2">eduTrack<span className="text-indigo-500">.</span></span>
              </div>
              <p className="text-slate-400 text-sm font-medium text-center md:text-left font-black tracking-tight uppercase">Dashboard Lifecycle Build | 2026</p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
              {['React', 'Context API', 'LocalStorage', 'Framer Motion'].map(l => (
                <span key={l} className="text-slate-500 font-bold hover:text-indigo-600 cursor-pointer transition-colors text-sm">{l}</span>
              ))}
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer transition-all"><Database size={18} /></div>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer transition-all"><Terminal size={18} /></div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Evaluation Element */}
      <StatPill icon={<Lock size={18} />} value="Client Only" label="Evaluation Protocol" delay={2} className="hidden 2xl:flex top-[70%] left-12" />

    </div>
  );
}
