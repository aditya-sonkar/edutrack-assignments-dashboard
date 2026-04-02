import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCoursesByAdmin, getAssignmentsByAdmin, getAssignmentSubmissions, getUsers } from '../../utils/localStorage';
import { Link } from 'react-router-dom';
import { PlusCircle, BarChart3, FileBadge, GraduationCap, RefreshCw, Sparkles, ChevronRight, BookOpen, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const colorMap = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', glow: 'shadow-indigo-600/10', bar: 'bg-indigo-500', icon: 'bg-indigo-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', glow: 'shadow-violet-600/10', bar: 'bg-violet-500', icon: 'bg-violet-100' },
  sky:    { bg: 'bg-sky-50',    text: 'text-sky-600',    border: 'border-sky-100',    glow: 'shadow-sky-600/10',    bar: 'bg-sky-500',    icon: 'bg-sky-100'    },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-100',   glow: 'shadow-teal-600/10',   bar: 'bg-teal-500',   icon: 'bg-teal-100'   },
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

const AdminDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseMeta, setCourseMeta] = useState({});

  const loadData = React.useCallback(() => {
    const myCourses = getCoursesByAdmin(user.id);
    const myAssignments = getAssignmentsByAdmin(user.id);
    const allUsers = getUsers();
    const allStudents = allUsers.filter(u => u.role === 'student');
    setStudents(allStudents);
    setCourses(myCourses);

    // Per-course stats
    const meta = {};
    myCourses.forEach(course => {
      const courseAssignments = myAssignments.filter(a => a.courseId === course.id);
      const totalSubmissions = courseAssignments.reduce((acc, a) => {
        return acc + getAssignmentSubmissions(a.id).filter(s => s.status === 'submitted').length;
      }, 0);
      const possible = courseAssignments.length * allStudents.length;
      meta[course.id] = {
        assignmentCount: courseAssignments.length,
        submittedCount: totalSubmissions,
        completion: possible === 0 ? 0 : Math.round((totalSubmissions / possible) * 100),
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

  const totalAssignments = Object.values(courseMeta).reduce((a, m) => a + m.assignmentCount, 0);
  const totalSubmissions  = Object.values(courseMeta).reduce((a, m) => a + m.submittedCount, 0);
  const possibleAll       = totalAssignments * students.length;
  const overallCompletion = possibleAll === 0 ? 0 : Math.round((totalSubmissions / possibleAll) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-12">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Sparkles size={14} className="animate-pulse" /></div>
            <span className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px]">Instructor Control Hub</span>
          </motion.div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-900 tracking-tight leading-[1.1]">
            Course Overview<span className="text-indigo-600">.</span>
          </h2>
          <p className="font-script text-indigo-400 text-2xl mt-4 -rotate-2 origin-left">Welcome back, {user.name.split(' ')[0]}!</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95, rotate: 180 }}
          onClick={loadData} title="Refresh"
          className="inline-flex items-center justify-center w-14 h-14 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-600/5 group"
        >
          <RefreshCw size={22} className="group-hover:rotate-45" />
        </motion.button>
      </div>

      {/* ── STATS ROW ── */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-16 h-16 bg-white rounded-[20px] shadow-sm border border-slate-50 flex items-center justify-center mb-8 text-indigo-600 group-hover:scale-110 group-hover:rotate-3 transition-transform">
            <BookOpen size={32} />
          </div>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-1">Total Courses</p>
          <p className="text-6xl font-serif font-black text-slate-900 leading-none">{courses.length}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-16 h-16 bg-white rounded-[20px] shadow-sm border border-slate-50 flex items-center justify-center mb-8 text-teal-500 group-hover:scale-110 group-hover:rotate-3 transition-transform">
            <FileBadge size={32} />
          </div>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-1">Total Assignments</p>
          <p className="text-6xl font-serif font-black text-slate-900 leading-none">{totalAssignments}</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-[10px] font-black uppercase tracking-widest border border-teal-100">
            {students.length} enrolled students
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-900 p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-[20px] border border-white/10 flex items-center justify-center mb-8 text-indigo-400">
            <BarChart3 size={32} />
          </div>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-1">Overall Completion</p>
          <p className="text-6xl font-serif font-black text-white leading-none">{overallCompletion}%</p>
          <div className="h-2 w-full bg-white/10 rounded-full mt-6 overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${overallCompletion}%` }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* ── COURSES GRID ── */}
      <div>
        <div className="flex items-center gap-4 mb-8">
          <h3 className="text-3xl font-serif font-black text-slate-900 tracking-tight">My Courses</h3>
          <span className="bg-white border border-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">{courses.length} active</span>
          <div className="hidden lg:block h-[1px] flex-1 bg-gradient-to-r from-slate-100 via-slate-50 to-transparent" />
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {courses.map((course) => {
            const meta  = courseMeta[course.id] || { assignmentCount: 0, submittedCount: 0, completion: 0 };
            const color = colorMap[course.color] || colorMap.indigo;

            return (
              <motion.div variants={itemVariants} key={course.id} className="group relative">
                <Link
                  to={`/admin/course/${course.id}`}
                  className={`block bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:${color.glow} hover:border-slate-200 transition-all duration-500 overflow-hidden p-8`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 ${color.icon} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                      <GraduationCap size={26} className={color.text} />
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${color.bg} ${color.text} border ${color.border}`}>
                      {course.code}
                    </span>
                  </div>

                  {/* Name */}
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-1 leading-tight group-hover:text-indigo-600 transition-colors">
                    {course.name}
                  </h4>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">{course.semester}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                      <FileBadge size={13} /> {meta.assignmentCount} tasks
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                      <Users size={13} /> {students.length} students
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion</span>
                      <span className={`text-[11px] font-black ${color.text}`}>{meta.completion}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${color.bar} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${meta.completion}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <div className={`mt-6 flex items-center gap-2 ${color.text} text-[11px] font-black uppercase tracking-widest`}>
                    Manage Course
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

export default AdminDashboard;
