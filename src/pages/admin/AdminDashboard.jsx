import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAssignmentsByAdmin, getAssignmentSubmissions, getUsers, deleteAssignment } from '../../utils/localStorage';
import { Link } from 'react-router-dom';
import { PlusCircle, Users, CheckCircle2, Circle, Clock, ChevronDown, BarChart3, FileBadge, GraduationCap, RefreshCw, CalendarPlus, Trash2, AlertTriangle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const confirmDelete = (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const executeDelete = () => {
    if (deletingId) {
      deleteAssignment(deletingId);
      setDeletingId(null);
      loadData();
    }
  };

  const loadData = React.useCallback(() => {
    const adminAssignments = getAssignmentsByAdmin(user.id);
    adminAssignments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const enriched = adminAssignments.map(assignment => {
      const subs = getAssignmentSubmissions(assignment.id);
      return { ...assignment, submissions: subs };
    });

    setAssignments(enriched);
    const allUsers = getUsers();
    setStudents(allUsers.filter(u => u.role === 'student'));
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

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  // Quick Stats
  const totalAssignments = assignments.length;
  const totalSubmissions = assignments.reduce((acc, curr) => acc + curr.submissions.filter(s => s.status === 'submitted').length, 0);
  const possibleSubmissions = totalAssignments * students.length;
  const overallCompletion = possibleSubmissions === 0 ? 0 : Math.round((totalSubmissions / possibleSubmissions) * 100);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-12">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-2 mb-4">
             <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles size={14} className="animate-pulse" />
             </div>
             <span className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px]">Instructor Control Hub</span>
          </motion.div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-slate-900 tracking-tight leading-[1.1]">
            Management Center<span className="text-indigo-600">.</span>
          </h2>
          <p className="font-script text-indigo-400 text-2xl mt-4 -rotate-2 origin-left">Welcome back, {user.name.split(' ')[0]}!</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, rotate: 180 }}
            onClick={loadData}
            title="Refresh submissions"
            className="inline-flex items-center justify-center w-14 h-14 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 rounded-[22px] transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-600/5 group"
          >
            <RefreshCw size={22} className="group-hover:rotate-45" />
          </motion.button>
          <Link
            to="/admin/create"
            className="inline-flex items-center justify-center h-14 px-8 bg-indigo-600 hover:bg-slate-900 text-white font-black rounded-[22px] transition-all shadow-xl shadow-indigo-600/20 hover:shadow-slate-900/20 hover:-translate-y-1 uppercase tracking-widest text-xs"
          >
            <PlusCircle size={20} className="mr-3" />
            Post New Task
          </Link>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="w-16 h-16 bg-white rounded-[20px] shadow-sm border border-slate-50 flex items-center justify-center mb-8 text-indigo-600 group-hover:scale-110 group-hover:rotate-3 transition-transform">
             <FileBadge size={32} />
           </div>
           <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-1">Total Assignments</p>
           <p className="text-6xl font-serif font-black text-slate-900 leading-none">{totalAssignments}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="w-16 h-16 bg-white rounded-[20px] shadow-sm border border-slate-50 flex items-center justify-center mb-8 text-teal-500 group-hover:scale-110 group-hover:rotate-3 transition-transform">
             <CheckCircle2 size={32} />
           </div>
           <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-1">Total Deliveries</p>
           <p className="text-6xl font-serif font-black text-slate-900 leading-none">{totalSubmissions}</p>
           <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-[10px] font-black uppercase tracking-widest border border-teal-100">
             Excellent completion rate
           </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-900 p-8 rounded-[32px] shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
           <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-[20px] border border-white/10 flex items-center justify-center mb-8 text-indigo-400">
             <BarChart3 size={32} />
           </div>
           <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mb-1">Average Completion</p>
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

      {/* ── LIST AREA ── */}
      <div className="pt-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h3 className="text-3xl font-serif font-black text-slate-900 tracking-tight">Active Tasks</h3>
            <span className="bg-white border border-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">{assignments.length} total</span>
          </div>
          <div className="hidden lg:block h-[1px] flex-1 mx-12 bg-gradient-to-r from-slate-100 via-slate-50 to-transparent" />
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          {assignments.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center p-24 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 transition-transform group-hover:scale-110 group-hover:rotate-12">
                <PlusCircle size={40} className="text-slate-300" />
              </div>
              <h3 className="text-3xl font-serif font-black text-slate-900 mb-3">No assignments active</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 text-lg italic">Ready to engage your students with something new?</p>
              <Link 
                to="/admin/create"
                className="inline-flex items-center px-10 py-5 bg-indigo-600 hover:bg-slate-900 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-xs"
              >
                Create Your First Assignment
              </Link>
            </motion.div>
          ) : (
            assignments.map((assignment) => {
              const submittedCount = assignment.submissions.filter(s => s.status === 'submitted').length;
              const totalStudents = students.length;
              const progressPercent = totalStudents === 0 ? 0 : Math.round((submittedCount / totalStudents) * 100);
              const isExpanded = expandedId === assignment.id;
              
              return (
                <motion.div variants={itemVariants} layout key={assignment.id} className={`bg-white rounded-[32px] border transition-all duration-500 overflow-hidden ${isExpanded ? 'border-indigo-200 shadow-[0_30px_90px_-20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-50' : 'border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200'}`}>
                  
                  <div 
                    className="p-8 sm:p-10 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative"
                    onClick={() => toggleExpand(assignment.id)}
                  >
                    <div className="flex-1 relative z-10">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                         <h3 className="text-3xl font-black text-slate-900 leading-tight w-full tracking-tighter">{assignment.title}</h3>
                         <div className="flex gap-2">
                           <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-slate-50 text-slate-500 flex items-center uppercase tracking-widest border border-slate-100">
                             <Clock size={11} className="mr-2" />
                             Due {new Date(assignment.dueDate).toLocaleDateString()}
                           </span>
                           <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center uppercase tracking-widest leading-none">
                             Deployed
                           </span>
                         </div>
                      </div>
                      <p className="text-slate-400 font-medium text-base leading-relaxed line-clamp-2 max-w-2xl">{assignment.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-10 w-full lg:w-auto shrink-0">
                      <div className="flex-1 lg:w-72 bg-slate-50/50 rounded-3xl p-6 border border-slate-100/50">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analytics Coverage</span>
                          <span className={`text-[11px] font-black px-3 py-1 rounded-lg ${progressPercent === 100 ? 'bg-teal-100 text-teal-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {submittedCount}/{totalStudents} Students
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-white rounded-full overflow-hidden shadow-inner border border-slate-100">
                          <motion.div 
                            className={`h-full rounded-full ${progressPercent === 100 ? 'bg-teal-500' : 'bg-indigo-600'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button 
                          onClick={(e) => confirmDelete(e, assignment.id)}
                          className="w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center transition-all bg-white border border-slate-100 text-rose-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 shadow-sm"
                          title="Delete Assignment"
                        >
                          <Trash2 size={24} />
                        </button>
                        <button className={`w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-slate-900 text-white rotate-180 shadow-2xl shadow-slate-900/40' : 'bg-white border border-slate-100 text-slate-300 shadow-sm hover:text-slate-900'}`}>
                          <ChevronDown size={28} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 bg-slate-50/30 p-10"
                      >
                        <div className="flex items-center gap-3 mb-8">
                           <h4 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Participant Breakdown</h4>
                           <div className="h-[1px] flex-1 bg-slate-100" />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {students.map(student => {
                            const sub = assignment.submissions.find(s => s.studentId === student.id);
                            const isSubmitted = sub && sub.status === 'submitted';
                            
                            return (
                              <motion.div whileHover={{ scale: 1.02 }} key={student.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-lg transition-all group">
                                <div className="flex items-center gap-4">
                                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black transition-colors ${isSubmitted ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                                     {student.name.charAt(0)}
                                   </div>
                                   <span className={`font-bold text-base tracking-tight ${isSubmitted ? 'text-slate-900 font-black' : 'text-slate-500'}`}>{student.name}</span>
                                </div>
                                <div className={`p-2 transition-transform duration-500 ${isSubmitted ? 'text-teal-500 rotate-0' : 'text-slate-100 group-hover:text-slate-200'}`}>
                                  <CheckCircle2 size={26} />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>

      {/* ── DELETE MODAL ── */}
      <AnimatePresence>
        {deletingId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl relative border border-slate-100"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-inner border border-rose-100">
                <AlertTriangle size={36} />
              </div>
              <h3 className="text-3xl font-serif font-black text-slate-900 text-center mb-3">Delete Access?</h3>
              <p className="text-slate-500 text-center mb-10 text-lg italic leading-relaxed">This action cannot be undone. All student progress and data will be permanently removed.</p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={executeDelete}
                  className="w-full py-5 bg-rose-600 hover:bg-slate-900 text-white font-black rounded-2xl transition-all shadow-xl shadow-rose-600/20 uppercase tracking-widest text-xs"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setDeletingId(null)}
                  className="w-full py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard;
