import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAssignments, getStudentSubmissions } from '../../utils/localStorage';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Circle, Clock, ChevronRight, Sparkles, BookOpen, AlertCircle, ListFilter, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FILTERS = ['All', 'Pending', 'Submitted'];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const allAssignments = getAssignments();
    allAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    setAssignments(allAssignments);
    setSubmissions(getStudentSubmissions(user.id));
  }, [user.id]);

  const getSubmissionStatus = (id) => submissions.find(s => s.assignmentId === id)?.status || 'pending';

  const completedCount = assignments.filter(a => getSubmissionStatus(a.id) === 'submitted').length;
  const pendingCount = assignments.filter(a => getSubmissionStatus(a.id) !== 'submitted').length;
  const totalCount = assignments.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const filteredAssignments = assignments.filter(a => {
    const submitted = getSubmissionStatus(a.id) === 'submitted';
    if (activeFilter === 'Submitted') return submitted;
    if (activeFilter === 'Pending') return !submitted;
    return true;
  });

  const filterCounts = {
    All: totalCount,
    Pending: pendingCount,
    Submitted: completedCount,
  };

  const getDaysRemainingInfo = (dueDateString) => {
    if (!dueDateString) return { text: 'No due date', urgent: false };
    const dueDate = new Date(dueDateString);
    if (isNaN(dueDate.getTime())) return { text: 'Unknown date', urgent: false };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dueDate.getTime());
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: 'Overdue', urgent: true };
    if (diffDays === 0) return { text: 'Due today', urgent: true };
    if (diffDays === 1) return { text: 'Due tomorrow', urgent: true };
    return { text: `${diffDays} days left`, urgent: diffDays <= 3 };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-12 pb-12">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-2 mb-4">
             <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles size={14} className="animate-pulse" />
             </div>
             <span className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px]">Academic Overview</span>
          </motion.div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-black text-slate-900 tracking-tight leading-[1.05]">
            Welcome back,<br />
            <span className="relative inline-block px-1">
              <span className="relative z-10 text-indigo-600 italic">{user.name.split(' ')[0]}</span>
              {/* Artistic Hand-drawn Highlight (Procreate Influence) */}
              <svg className="absolute -bottom-1 left-0 w-full h-3 text-indigo-100/60" viewBox="0 0 100 12" fill="none" preserveAspectRatio="none">
                 <path d="M2.5 9.5C40.5 4.5 120.5 1.5 197.5 9.5" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="font-script text-indigo-400 text-3xl mt-4 -rotate-2 origin-left">Ready to conquer the week?</p>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden bg-slate-900 rounded-[40px] p-8 sm:p-12 md:p-14 shadow-[0_30px_90px_-20px_rgba(15,23,42,0.3)] group"
      >
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-blob" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] brightness-100 mix-blend-overlay" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-white/5">
              <TrendingUp size={12} /> Live Performance Tracker
            </div>
            <h3 className="text-3xl md:text-4xl font-serif font-black text-white mb-6 leading-tight tracking-tight">Your Academic Journey.</h3>
            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl italic">
               Phenomenal progress! You've successfully deployed <strong className="text-white font-black">{completedCount}</strong> assignments. Maintaining this momentum is <span className="text-indigo-400 underline decoration-indigo-400/30 decoration-4">excellence</span>.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-2xl">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-white font-bold text-sm tracking-tight">{completedCount} Submitted</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-2xl">
                <Clock size={16} className="text-indigo-400" />
                <span className="text-white font-bold text-sm tracking-tight">{pendingCount} Active Tasks</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-8 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[40px] shrink-0 shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-700">
             {/* Progress Circle with Bardot Influence */}
             <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                   <motion.circle 
                     cx="50" cy="50" r="45" 
                     fill="none" stroke="#6366f1" 
                     strokeWidth="10"
                     strokeLinecap="round"
                     strokeDasharray={`${2 * Math.PI * 45}`}
                     initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                     animate={{ strokeDashoffset: (2 * Math.PI * 45) * (1 - progressPercent / 100) }}
                     transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-4xl font-serif font-black text-white">{progressPercent}%</span>
                </div>
             </div>
             <div className="hidden sm:block">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Effort</p>
                <p className="text-white font-black text-2xl tracking-tighter leading-none mb-2">Completion</p>
                <div className="h-1 w-full bg-white/10 rounded-full mt-3 overflow-hidden">
                   <motion.div className="h-full bg-indigo-500" initial={{width:0}} animate={{width:`${progressPercent}%`}} transition={{delay:1, duration:1.5}} />
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* ── LIST AREA ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-10">
          <div className="flex items-center gap-6">
            <h3 className="text-3xl font-serif font-black text-slate-900 tracking-tight leading-none">Assignment List</h3>
            <span className="bg-white border border-slate-100 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">{filteredAssignments.length} total</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-[24px] border border-slate-100 self-start shadow-inner">
            {FILTERS.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`relative px-5 py-2.5 rounded-[18px] text-[11px] font-black transition-all duration-300 uppercase tracking-widest ${
                  activeFilter === filter ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {activeFilter === filter && (
                  <motion.div
                    layoutId="filter-pill"
                    className="absolute inset-0 bg-white rounded-[18px] shadow-md border border-slate-100"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2.5">
                  {filter}
                  <span className={`text-[9px] px-2 py-0.5 rounded-lg leading-none ${
                    activeFilter === filter ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {filterCounts[filter]}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {filteredAssignments.length === 0 ? (
              <motion.div variants={itemVariants} className="md:col-span-2 flex flex-col items-center justify-center p-24 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-50/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    {activeFilter === 'Submitted' ? <CheckCircle2 size={40} className="text-slate-300" /> : <BookOpen size={40} className="text-slate-300" />}
                  </div>
                  <h3 className="text-3xl font-serif font-black text-slate-900 mb-3 tracking-tight">
                    {activeFilter === 'Submitted' ? 'No work found' : activeFilter === 'Pending' ? "Freedom attained!" : 'Silence reigns'}
                  </h3>
                  <p className="text-slate-400 font-medium text-center max-w-sm text-lg italic leading-relaxed">
                    {activeFilter === 'Submitted'
                      ? 'Deploy an assignment and track its status here.'
                      : activeFilter === 'Pending'
                      ? 'You have conquered all pending tasks. Total victory.'
                      : "The instructors haven't posted any tasks yet."}
                  </p>
                </div>
              </motion.div>
            ) : (
              filteredAssignments.map((assignment) => {
                const status = getSubmissionStatus(assignment.id);
                const isSubmitted = status === 'submitted';
                const timeInfo = getDaysRemainingInfo(assignment.dueDate);
                
                return (
                  <motion.div variants={itemVariants} key={assignment.id} className="relative group">
                    <Link 
                      to={`/student/assignment/${assignment.id}`} 
                      className={`relative flex flex-col h-full bg-white p-8 sm:p-10 rounded-[32px] border transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-indigo-600/5 ${
                        isSubmitted ? 'border-teal-100' : 'border-slate-100 hover:border-indigo-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-8">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3 ${isSubmitted ? 'bg-teal-50 text-teal-500' : 'bg-slate-50 text-slate-300'}`}>
                          {isSubmitted ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                        </div>
                        
                        {isSubmitted ? (
                          <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-teal-50 text-teal-600 border border-teal-100 shadow-sm">
                             Completed
                          </span>
                        ) : timeInfo.urgent ? (
                          <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                             Priority Task
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100 font-black">
                             Active
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 mb-8">
                        <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors">
                          {assignment.title}
                        </h4>
                        <p className="text-slate-400 font-medium text-base leading-relaxed line-clamp-2 italic">
                          {assignment.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-8 border-t border-slate-50 group-hover:border-indigo-50 transition-colors">
                        <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                          isSubmitted ? 'text-teal-500' : 
                          timeInfo.urgent ? 'text-rose-600 font-black' : 'text-slate-400'
                        }`}>
                          {isSubmitted ? <CheckCircle2 size={14} /> : <Clock size={14} className={timeInfo.urgent ? 'animate-spin-slow' : ''} />}
                          {isSubmitted ? 'Task Verified' : timeInfo.text}
                        </div>

                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all transform ${isSubmitted ? 'bg-teal-50 text-teal-500' : 'bg-slate-50 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white shadow-lg shadow-indigo-600/20'}`}>
                          <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                    {/* Decorative Hand-drawn Script Note */}
                    {!isSubmitted && timeInfo.urgent && (
                      <div className="absolute -bottom-6 right-6 font-script text-rose-400 text-xl rotate-6 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                        Don't miss this!
                      </div>
                    )}
                  </motion.div>
                )
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── FLOATERS ── */}
      <div className="absolute top-[80%] left-[-100px] opacity-10 hidden xl:block pointer-events-none">
         <svg width="200" height="200" viewBox="0 0 200 200">
            <path d="M10 10C50 150 150 150 190 50M190 50L175 45M190 50L185 65" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" />
         </svg>
      </div>

    </motion.div>
  );
};

export default StudentDashboard;
