import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentCourses, getAssignmentsByCourse, getStudentSubmissions } from '../../utils/localStorage';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, ChevronRight, Sparkles, TrendingUp, GraduationCap, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const colorMap = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', bar: 'bg-indigo-500', ring: 'stroke-indigo-500', icon: 'bg-indigo-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', bar: 'bg-violet-500', ring: 'stroke-violet-500', icon: 'bg-violet-100' },
  sky:    { bg: 'bg-sky-50',    text: 'text-sky-600',    border: 'border-sky-100',    bar: 'bg-sky-500',    ring: 'stroke-sky-500',    icon: 'bg-sky-100'    },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-100',   bar: 'bg-teal-500',   ring: 'stroke-teal-500',   icon: 'bg-teal-100'   },
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courses,     setCourses]     = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [courseMeta,  setCourseMeta]  = useState({});

  const loadData = React.useCallback(() => {
    const myCourses = getStudentCourses();
    const mySubs    = getStudentSubmissions(user.id);
    setCourses(myCourses);
    setSubmissions(mySubs);

    const meta = {};
    myCourses.forEach(course => {
      const courseAssignments = getAssignmentsByCourse(course.id);
      const submitted = courseAssignments.filter(a => mySubs.find(s => s.assignmentId === a.id && s.status === 'submitted')).length;
      meta[course.id] = {
        total:      courseAssignments.length,
        submitted,
        pending:    courseAssignments.length - submitted,
        completion: courseAssignments.length === 0 ? 0 : Math.round((submitted / courseAssignments.length) * 100),
      };
    });
    setCourseMeta(meta);
  }, [user.id]);

  useEffect(() => {
    loadData();
    const onVisible = () => { if (document.visibilityState === 'visible') loadData(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', loadData);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', loadData);
    };
  }, [loadData]);

  const totalAssignments = Object.values(courseMeta).reduce((a, m) => a + m.total, 0);
  const totalSubmitted   = Object.values(courseMeta).reduce((a, m) => a + m.submitted, 0);
  const totalPending     = totalAssignments - totalSubmitted;
  const overallPct       = totalAssignments === 0 ? 0 : Math.round((totalSubmitted / totalAssignments) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-12 pb-12">

      {/* ── HEADER ── */}
      <div>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Sparkles size={14} className="animate-pulse" /></div>
          <span className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px]">Academic Overview</span>
        </motion.div>
        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-black text-slate-900 tracking-tight leading-[1.05]">
          Welcome back,<br />
          <span className="relative inline-block px-1">
            <span className="relative z-10 text-indigo-600 italic">{user.name.split(' ')[0]}</span>
            <svg className="absolute -bottom-1 left-0 w-full h-3 text-indigo-100/60" viewBox="0 0 100 12" fill="none" preserveAspectRatio="none">
              <path d="M2.5 9.5C40.5 4.5 120.5 1.5 197.5 9.5" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </span>
        </h2>
        <p className="font-script text-indigo-400 text-3xl mt-4 -rotate-2 origin-left">Ready to conquer the week?</p>
      </div>

      {/* ── HERO BANNER ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="relative overflow-hidden bg-slate-900 rounded-[40px] p-8 sm:p-12 shadow-[0_30px_90px_-20px_rgba(15,23,42,0.3)] group">
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-blob" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-white/5">
              <TrendingUp size={12} /> Live Performance Tracker
            </div>
            <h3 className="text-3xl md:text-4xl font-serif font-black text-white mb-6 leading-tight tracking-tight">Your Academic Journey.</h3>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl italic">
              Phenomenal progress! You've acknowledged <strong className="text-white font-black">{totalSubmitted}</strong> assignments across{' '}
              <strong className="text-white font-black">{courses.length}</strong> courses.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-2xl">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-white font-bold text-sm">{totalSubmitted} Submitted</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-2xl">
                <Clock size={16} className="text-indigo-400" />
                <span className="text-white font-bold text-sm">{totalPending} Pending</span>
              </div>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="flex items-center gap-8 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[40px] shrink-0 shadow-2xl group-hover:scale-105 transition-transform duration-700">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <motion.circle cx="50" cy="50" r="45" fill="none" stroke="#6366f1" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                  animate={{ strokeDashoffset: (2 * Math.PI * 45) * (1 - overallPct / 100) }}
                  transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-serif font-black text-white">{overallPct}%</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Effort</p>
              <p className="text-white font-black text-2xl tracking-tighter leading-none mb-2">Completion</p>
              <div className="h-1 w-full bg-white/10 rounded-full mt-3 overflow-hidden">
                <motion.div className="h-full bg-indigo-500" initial={{ width: 0 }} animate={{ width: `${overallPct}%` }} transition={{ delay: 1, duration: 1.5 }} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── COURSES GRID ── */}
      <div>
        <div className="flex items-center gap-4 mb-8">
          <h3 className="text-3xl font-serif font-black text-slate-900 tracking-tight">My Courses</h3>
          <span className="bg-white border border-slate-100 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">{courses.length} enrolled</span>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {courses.map((course) => {
            const meta  = courseMeta[course.id] || { total: 0, submitted: 0, pending: 0, completion: 0 };
            const color = colorMap[course.color] || colorMap.indigo;

            return (
              <motion.div variants={itemVariants} key={course.id} className="group">
                <Link to={`/student/course/${course.id}`}
                  className="block bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all duration-500 overflow-hidden p-8">

                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 ${color.icon} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                      <GraduationCap size={26} className={color.text} />
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${color.bg} ${color.text} border ${color.border}`}>
                      {course.code}
                    </span>
                  </div>

                  <h4 className={`text-2xl font-black text-slate-900 tracking-tight mb-1 leading-tight group-hover:${color.text} transition-colors`}>
                    {course.name}
                  </h4>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">{course.semester}</p>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                      <CheckCircle2 size={13} className="text-emerald-400" /> {meta.submitted} done
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                      <Clock size={13} className="text-amber-400" /> {meta.pending} pending
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                      <BookOpen size={13} /> {meta.total} total
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                      <span className={`text-[11px] font-black ${color.text}`}>{meta.completion}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div className={`h-full ${color.bar} rounded-full`}
                        initial={{ width: 0 }} animate={{ width: `${meta.completion}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                      />
                    </div>
                  </div>

                  <div className={`mt-6 flex items-center gap-2 ${color.text} text-[11px] font-black uppercase tracking-widest`}>
                    View Assignments
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
