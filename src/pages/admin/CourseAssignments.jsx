import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getCourseById, getAssignmentsByCourse, getAssignmentSubmissions,
  getUsers, deleteAssignment
} from '../../utils/localStorage';
import {
  PlusCircle, CheckCircle2, Clock, ChevronDown, BarChart3,
  Trash2, AlertTriangle, Sparkles, ArrowLeft, Users, Calendar,
  RefreshCw, UserCheck, UserX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const colorMap = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', bar: 'bg-indigo-500', pill: 'bg-indigo-600' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', bar: 'bg-violet-500', pill: 'bg-violet-600' },
  sky:    { bg: 'bg-sky-50',    text: 'text-sky-600',    border: 'border-sky-100',    bar: 'bg-sky-500',    pill: 'bg-sky-600'    },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-100',   bar: 'bg-teal-500',   pill: 'bg-teal-600'   },
};

const itemVariants = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

const AdminCourseAssignments = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course,      setCourse]      = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [students,    setStudents]    = useState([]);
  const [expandedId,  setExpandedId]  = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);
  const [filter,      setFilter]      = useState('all'); // all | submitted | pending | overdue

  const loadData = React.useCallback(() => {
    const c = getCourseById(courseId);
    if (!c) { navigate('/admin'); return; }
    setCourse(c);
    const allStudents = getUsers().filter(u => u.role === 'student');
    setStudents(allStudents);
    const raw = getAssignmentsByCourse(courseId);
    raw.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setAssignments(raw.map(a => ({ ...a, submissions: getAssignmentSubmissions(a.id) })));
  }, [courseId, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const executeDelete = () => {
    if (deletingId) { deleteAssignment(deletingId); setDeletingId(null); loadData(); }
  };

  if (!course) return null;
  const color = colorMap[course.color] || colorMap.indigo;

  const totalSubmissions = assignments.reduce((acc, a) => acc + a.submissions.filter(s => s.status === 'submitted').length, 0);
  const possible = assignments.length * students.length;
  const overallCompletion = possible === 0 ? 0 : Math.round((totalSubmissions / possible) * 100);

  const filteredAssignments = assignments.filter(a => {
    const submittedCount = a.submissions.filter(s => s.status === 'submitted').length;
    const isPastDue      = new Date(a.dueDate) < new Date();
    if (filter === 'submitted') return submittedCount === students.length;
    if (filter === 'pending')   return submittedCount < students.length && !isPastDue;
    if (filter === 'overdue')   return isPastDue && submittedCount < students.length;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-10">

      {/* ── BACK ── */}
      <Link to="/admin" className="group inline-flex items-center text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-[0.2em]">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1.5 transition-transform duration-300" />
        Back to Courses
      </Link>

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${color.bg} ${color.text} border ${color.border}`}>{course.code}</span>
            <span className="text-slate-300 text-[10px] font-bold">{course.semester}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-black text-slate-900 tracking-tight leading-tight">{course.name}<span className={color.text}>.</span></h2>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <BarChart3 size={13} /> {overallCompletion}% class completion
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
              <Users size={13} /> {students.length} enrolled students
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={loadData}
            className="w-12 h-12 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm group flex items-center justify-center">
            <RefreshCw size={18} className="group-hover:rotate-45 transition-transform" />
          </motion.button>
          <Link to={`/admin/course/${courseId}/create`}
            className={`inline-flex items-center h-12 px-6 ${color.pill} hover:bg-slate-900 text-white font-black rounded-2xl transition-all shadow-xl text-xs uppercase tracking-widest gap-2`}>
            <PlusCircle size={18} /> New Assignment
          </Link>
        </div>
      </div>

      {/* ── ASSIGNMENT LIST ── */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <h3 className="text-2xl font-serif font-black text-slate-900">Assignments</h3>
          <span className="bg-white border border-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">{assignments.length} total</span>
          <div className="ml-auto flex items-center gap-2">
            {[['all','All'],['submitted','Submitted'],['pending','Pending'],['overdue','Overdue']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === val
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-white border border-slate-100 text-slate-400 hover:text-slate-700 hover:border-slate-200'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="text-center p-20 bg-white rounded-[40px] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6"><PlusCircle size={36} className="text-slate-300" /></div>
            <h3 className="text-2xl font-serif font-black text-slate-900 mb-2">{filter === 'all' ? 'No assignments yet' : `No ${filter} assignments`}</h3>
            <p className="text-slate-400 font-medium mb-8 italic">{filter === 'all' ? 'Start engaging your students with the first assignment.' : 'Try a different filter.'}</p>
            {filter === 'all' && (
              <Link to={`/admin/course/${courseId}/create`}
                className={`inline-flex items-center px-8 py-4 ${color.pill} hover:bg-slate-900 text-white font-black rounded-2xl transition-all shadow-xl text-xs uppercase tracking-widest gap-2`}>
                <PlusCircle size={16} /> Create First Assignment
              </Link>
            )}
          </div>
        ) : (
          <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }} className="space-y-5">
            {filteredAssignments.map((assignment) => {
              const submittedCount  = assignment.submissions.filter(s => s.status === 'submitted').length;
              const progressPercent = students.length === 0 ? 0 : Math.round((submittedCount / students.length) * 100);
              const isExpanded      = expandedId === assignment.id;
              const isPastDue       = new Date(assignment.dueDate) < new Date();

              return (
                <motion.div variants={itemVariants} layout key={assignment.id}
                  className={`bg-white rounded-[28px] border transition-all duration-500 overflow-hidden ${isExpanded ? 'border-indigo-200 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)]' : 'border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50'}`}>

                  <div className="p-7 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative"
                    onClick={() => setExpandedId(isExpanded ? null : assignment.id)}>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{assignment.title}</h4>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          assignment.submissionType === 'Group'
                            ? 'bg-violet-50 text-violet-600 border border-violet-100'
                            : 'bg-sky-50 text-sky-600 border border-sky-100'
                        }`}>{assignment.submissionType}</span>
                        {isPastDue && <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-500 border border-rose-100">Overdue</span>}
                      </div>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed line-clamp-1 max-w-xl">{assignment.description}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs font-bold text-slate-400">
                        <Calendar size={12} /> Due {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      {/* Progress mini */}
                      <div className="w-56 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submissions</span>
                          <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${progressPercent === 100 ? 'bg-teal-100 text-teal-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {submittedCount}/{students.length}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner border border-slate-100">
                          <motion.div
                            className={`h-full rounded-full ${progressPercent === 100 ? 'bg-teal-500' : color.bar}`}
                            initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/admin/course/${courseId}/edit/${assignment.id}`}
                          onClick={e => e.stopPropagation()}
                          className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-slate-100 text-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm text-xs font-black"
                        >
                          ✎
                        </Link>
                        <button onClick={(e) => { e.stopPropagation(); setDeletingId(assignment.id); }}
                          className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-slate-100 text-rose-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
                          <Trash2 size={20} />
                        </button>
                        <button className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-slate-900 text-white rotate-180 shadow-xl' : 'bg-white border border-slate-100 text-slate-300 shadow-sm hover:text-slate-900'}`}>
                          <ChevronDown size={22} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 bg-slate-50/30 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <h5 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Student Breakdown</h5>
                          <div className="h-[1px] flex-1 bg-slate-100" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {students.map(student => {
                            const sub = assignment.submissions.find(s => s.studentId === student.id);
                            const done = sub && sub.status === 'submitted';
                            return (
                              <motion.div whileHover={{ scale: 1.02 }} key={student.id}
                                className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-lg transition-all group">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-colors ${done ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {student.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className={`font-bold text-sm tracking-tight ${done ? 'text-slate-900' : 'text-slate-500'}`}>{student.name}</p>
                                    {done && sub.acknowledgedAt && (
                                      <p className="text-[10px] text-slate-400 font-medium">
                                        {new Date(sub.acknowledgedAt).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {done
                                  ? <UserCheck size={20} className="text-teal-500" />
                                  : <UserX size={20} className="text-slate-200 group-hover:text-slate-300" />}
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ── DELETE MODAL ── */}
      <AnimatePresence>
        {deletingId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl border border-slate-100">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[28px] flex items-center justify-center mx-auto mb-8 border border-rose-100">
                <AlertTriangle size={36} />
              </div>
              <h3 className="text-3xl font-serif font-black text-slate-900 text-center mb-3">Delete Assignment?</h3>
              <p className="text-slate-500 text-center mb-10 text-lg italic leading-relaxed">This cannot be undone. All student submissions will be permanently removed.</p>
              <div className="flex flex-col gap-4">
                <button onClick={executeDelete}
                  className="w-full py-5 bg-rose-600 hover:bg-slate-900 text-white font-black rounded-2xl transition-all shadow-xl text-xs uppercase tracking-widest">
                  Confirm Delete
                </button>
                <button onClick={() => setDeletingId(null)}
                  className="w-full py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all text-xs uppercase tracking-widest">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminCourseAssignments;
