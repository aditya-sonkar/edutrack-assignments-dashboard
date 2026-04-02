import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getCourseById, getAssignmentsByCourse, getStudentSubmissions
} from '../../utils/localStorage';
import {
  ArrowLeft, CheckCircle2, Circle, Clock, ChevronRight,
  Sparkles, ListFilter, Users, User, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FILTERS = ['All', 'Pending', 'Submitted'];

const colorMap = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', bar: 'bg-indigo-500' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', bar: 'bg-violet-500' },
  sky:    { bg: 'bg-sky-50',    text: 'text-sky-600',    border: 'border-sky-100',    bar: 'bg-sky-500'    },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-100',   bar: 'bg-teal-500'   },
};

const StudentCourseAssignments = () => {
  const { courseId }                = useParams();
  const { user }                    = useAuth();
  const [course,       setCourse]   = useState(null);
  const [assignments,  setAssignments]  = useState([]);
  const [submissions,  setSubmissions]  = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const c = getCourseById(courseId);
    setCourse(c);
    const sorted = getAssignmentsByCourse(courseId).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    setAssignments(sorted);
    setSubmissions(getStudentSubmissions(user.id));
  }, [courseId, user.id]);

  const getStatus = (id) => submissions.find(s => s.assignmentId === id)?.status || 'pending';

  const completedCount = assignments.filter(a => getStatus(a.id) === 'submitted').length;
  const pendingCount   = assignments.length - completedCount;
  const progressPct    = assignments.length === 0 ? 0 : Math.round((completedCount / assignments.length) * 100);

  const filtered = assignments.filter(a => {
    const done = getStatus(a.id) === 'submitted';
    if (activeFilter === 'Submitted') return done;
    if (activeFilter === 'Pending')   return !done;
    return true;
  });

  const filterCounts = { All: assignments.length, Pending: pendingCount, Submitted: completedCount };

  const getDaysInfo = (dateStr) => {
    if (!dateStr) return { text: 'No date', urgent: false };
    const diff  = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
    if (diff < 0)  return { text: 'Overdue',     urgent: true  };
    if (diff === 0) return { text: 'Due today',   urgent: true  };
    if (diff === 1) return { text: 'Due tomorrow',urgent: true  };
    return { text: `${diff} days left`, urgent: diff <= 3 };
  };

  if (!course) return null;
  const color = colorMap[course.color] || colorMap.indigo;

  const itemVariants = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-10 pb-12">

      {/* ── BACK ── */}
      <Link to="/student" className="group inline-flex items-center text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-[0.2em]">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1.5 transition-transform duration-300" />
        Back to Courses
      </Link>

      {/* ── COURSE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${color.bg} ${color.text} border ${color.border}`}>{course.code}</span>
            <span className="text-slate-300 text-[10px] font-bold">{course.semester}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-black text-slate-900 tracking-tight leading-tight">
            {course.name}<span className={color.text}>.</span>
          </h2>
        </div>
        {/* Groups link */}
        <Link to={`/student/course/${courseId}/groups`}
          className={`inline-flex items-center gap-2 h-12 px-6 ${color.bg} ${color.text} border ${color.border} rounded-2xl text-xs font-black uppercase tracking-widest hover:shadow-md transition-all`}>
          <Users size={16} /> Manage Groups
        </Link>
      </div>

      {/* ── PROGRESS BANNER ── */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Course Progress</span>
              <span className={`text-sm font-black ${color.text}`}>{completedCount} / {assignments.length} completed</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div className={`h-full ${color.bar} rounded-full`}
                initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <CheckCircle2 size={13} className="text-emerald-400" /> {completedCount} acknowledged
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Clock size={13} className="text-amber-400" /> {pendingCount} pending
              </div>
            </div>
          </div>
          <div className={`w-20 h-20 rounded-[24px] ${color.bg} flex flex-col items-center justify-center border ${color.border} shrink-0`}>
            <span className={`text-3xl font-serif font-black ${color.text}`}>{progressPct}%</span>
          </div>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-serif font-black text-slate-900">Assignments</h3>
          <span className="bg-white border border-slate-100 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-[24px] border border-slate-100 self-start shadow-inner">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`relative px-4 py-2 rounded-[18px] text-[11px] font-black transition-all duration-300 uppercase tracking-widest ${activeFilter === f ? color.text : 'text-slate-400 hover:text-slate-600'}`}>
              {activeFilter === f && (
                <motion.div layoutId="student-filter-pill"
                  className="absolute inset-0 bg-white rounded-[18px] shadow-md border border-slate-100"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {f}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-lg ${activeFilter === f ? `${color.bg} ${color.text}` : 'bg-slate-200 text-slate-500'}`}>
                  {filterCounts[f]}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── ASSIGNMENT CARDS ── */}
      <AnimatePresence mode="wait">
        <motion.div key={activeFilter}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.length === 0 ? (
            <div className="md:col-span-2 flex flex-col items-center justify-center p-20 bg-white rounded-[40px] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mb-6 transition-transform hover:rotate-6">
                {activeFilter === 'Submitted' ? <CheckCircle2 size={36} className="text-slate-300" /> : <Circle size={36} className="text-slate-300" />}
              </div>
              <h3 className="text-2xl font-serif font-black text-slate-900 mb-2">
                {activeFilter === 'Submitted' ? 'No submissions yet' : activeFilter === 'Pending' ? 'All done!' : 'No assignments'}
              </h3>
              <p className="text-slate-400 text-center font-medium italic">
                {activeFilter === 'Pending' ? 'You\'ve completed everything in this course. Excellent!' : 'Check back later for new assignments.'}
              </p>
            </div>
          ) : (
            filtered.map(assignment => {
              const done     = getStatus(assignment.id) === 'submitted';
              const timeInfo = getDaysInfo(assignment.dueDate);
              const isGroup  = assignment.submissionType === 'Group';

              return (
                <motion.div variants={itemVariants} key={assignment.id} className="group relative">
                  <Link to={`/student/assignment/${assignment.id}`}
                    className={`flex flex-col h-full bg-white p-8 rounded-[32px] border transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-indigo-600/5 ${
                      done ? 'border-teal-100' : 'border-slate-100 hover:border-indigo-100'
                    }`}>

                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3 ${done ? 'bg-teal-50 text-teal-500' : 'bg-slate-50 text-slate-300'}`}>
                        {done ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                          isGroup ? 'bg-violet-50 text-violet-600 border-violet-100' : 'bg-sky-50 text-sky-600 border-sky-100'
                        }`}>
                          {isGroup ? <><Users size={9} className="inline mr-1" />Group</> : <><User size={9} className="inline mr-1" />Individual</>}
                        </span>
                        {done ? (
                          <span className="px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-teal-50 text-teal-600 border border-teal-100">Acknowledged</span>
                        ) : timeInfo.urgent ? (
                          <span className="px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">Urgent</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex-1 mb-6">
                      <h4 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors">
                        {assignment.title}
                      </h4>
                      <p className="text-slate-400 font-medium text-sm leading-relaxed line-clamp-2 italic">{assignment.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 group-hover:border-indigo-50 transition-colors">
                      <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                        done ? 'text-teal-500' : timeInfo.urgent ? 'text-rose-600' : 'text-slate-400'
                      }`}>
                        {done ? <CheckCircle2 size={13} /> : <Calendar size={13} />}
                        {done ? 'Acknowledged' : timeInfo.text}
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${done ? 'bg-teal-50 text-teal-500' : 'bg-slate-50 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white shadow-lg shadow-indigo-600/20'}`}>
                        <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                  {!done && timeInfo.urgent && (
                    <div className="absolute -bottom-5 right-5 font-script text-rose-400 text-xl rotate-6 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      Don't miss this!
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentCourseAssignments;
