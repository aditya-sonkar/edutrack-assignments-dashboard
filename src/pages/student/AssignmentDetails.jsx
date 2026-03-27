import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAssignmentById, saveSubmission, getStudentSubmissions } from '../../utils/localStorage';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, ExternalLink, Send, CheckCircle2, Clock, Calendar, AlertCircle, FileText, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [driveLink, setDriveLink] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const found = getAssignmentById(id);
    if (!found) {
      toast.error('Assignment not found');
      navigate('/student');
      return;
    }
    setAssignment(found);
    
    const studentSubs = getStudentSubmissions(user.id);
    const existing = studentSubs.find(s => s.assignmentId === id);
    if (existing) {
      setSubmission(existing);
    }
  }, [id, user.id, navigate]);

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!driveLink.trim() || !/^https?:\/\//.test(driveLink)) {
      return toast.error('Please provide a valid URL starting with http:// or https://');
    }
    setShowConfirm(true);
  };

  const executeFinalSubmit = () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newSubmission = {
        id: `sub_${Date.now()}`,
        assignmentId: id,
        studentId: user.id,
        driveLink: driveLink,
        status: 'submitted',
        submittedAt: new Date().toISOString()
      };
      
      saveSubmission(newSubmission);
      setSubmission(newSubmission);
      setShowConfirm(false);
      setIsSubmitting(false);
      toast.success('Assignment submitted successfully! 🚀');
    }, 1500);
  };

  if (!assignment) return null;

  const isSubmitted = !!submission;
  const dueDate = new Date(assignment.dueDate);
  const isPastDue = dueDate < new Date() && !isSubmitted;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto space-y-10 pb-20 relative">
      
      {/* ── STICKY BACK BUTTON ── */}
      <Link to="/student" className="group inline-flex items-center text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-[0.2em] mb-4">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1.5 transition-transform duration-300" /> 
        Back to Dashboard
      </Link>

      {/* ── HEADER AREA ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
             <div className={`p-1.5 rounded-lg ${isSubmitted ? 'bg-teal-50 text-teal-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {isSubmitted ? <CheckCircle2 size={14} /> : <Sparkles size={14} />}
             </div>
             <span className={`${isSubmitted ? 'text-teal-600' : 'text-indigo-600'} font-black uppercase tracking-[0.2em] text-[10px]`}>
               {isSubmitted ? 'Submission Verified' : 'Mission Briefing'}
             </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-black text-slate-900 mb-4 tracking-tighter leading-tight">
             {assignment.title}
          </h2>
          <div className="flex flex-wrap gap-4 mt-6">
             <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-widest leading-none">
                <Calendar size={13} />
                Due {dueDate.toLocaleDateString()}
             </div>
             {assignment.driveLink && (
               <a 
                 href={assignment.driveLink} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest leading-none hover:bg-indigo-100 transition-colors"
               >
                 <ExternalLink size={13} />
                 Resource Assets
               </a>
             )}
          </div>
        </div>
        
        {isSubmitted && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="shrink-0 flex flex-col items-center">
             <div className="w-24 h-24 bg-teal-50 border-4 border-white shadow-xl shadow-teal-500/10 rounded-[32px] flex items-center justify-center text-teal-500 mb-3">
                <CheckCircle2 size={40} />
             </div>
             <p className="font-script text-teal-500 text-2xl rotate-[-2deg]">Great job!</p>
          </motion.div>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        
        {/* ═══════════════════════ LEFT: INSTRUCTIONS ═══════════════════════ */}
        <div className="lg:col-span-3 space-y-10">
          <div className="bg-white rounded-[40px] p-10 md:p-12 border border-slate-100 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.06)] relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-50 rounded-full blur-[60px] opacity-50 -translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-8">
                  <FileText className="text-indigo-400" size={20} />
                  <h4 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Detailed Strategy</h4>
                  <div className="h-[1px] flex-1 bg-slate-100" />
               </div>
               
               <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed italic whitespace-pre-wrap">
                  {assignment.description}
               </p>

               <div className="mt-16 pt-10 border-t border-slate-50 grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Post Date</p>
                       <p className="text-slate-700 font-bold text-base">{new Date(assignment.createdAt).toLocaleDateString()}</p>
                   </div>
                   <div className="space-y-2 text-right lg:text-left">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Platform</p>
                       <p className="text-slate-700 font-bold text-base">EduTrack Cloud</p>
                   </div>
               </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════ RIGHT: SUBMISSION PANEL ═══════════════════════ */}
        <div className="lg:col-span-2">
           <AnimatePresence mode="wait">
             {!isSubmitted ? (
               <motion.div 
                 key="form"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-slate-900 rounded-[40px] p-10 shadow-2xl relative overflow-hidden sticky top-32"
               >
                 <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] brightness-100 mix-blend-overlay pointer-events-none" />

                 <div className="relative z-10 space-y-8">
                   <div className="text-center">
                     <h4 className="text-white font-serif font-black text-3xl mb-2 tracking-tight">Deploy Solution</h4>
                     <p className="text-slate-400 font-medium text-sm leading-snug">Submit your work link to the instructor hub for review.</p>
                   </div>

                   <form onSubmit={handleInitialSubmit} className="space-y-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Asset Link (GitHub/Drive)</label>
                        <div className={`relative rounded-2xl transition-all duration-300 border border-white/10 bg-white/5 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500/50`}>
                           <ExternalLink size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                           <input 
                             type="url" 
                             required
                             value={driveLink}
                             onChange={e => setDriveLink(e.target.value)}
                             placeholder="https://github.com/..."
                             className="w-full h-16 pl-12 pr-5 bg-transparent border-0 rounded-2xl outline-none text-white font-bold placeholder:text-slate-700"
                           />
                        </div>
                     </div>

                     <button
                        type="submit"
                        className="w-full h-16 bg-indigo-600 hover:bg-white hover:text-indigo-900 text-white font-black rounded-[22px] transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                      >
                        Initiate Submission <Send size={18} />
                     </button>
                   </form>

                   {isPastDue && (
                     <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex gap-3">
                        <AlertCircle className="text-rose-400 shrink-0" size={20} />
                        <p className="text-rose-200 text-xs font-bold leading-relaxed">This task is past its deadline. Late submission protocols may apply.</p>
                     </div>
                   )}
                 </div>
               </motion.div>
             ) : (
               <motion.div 
                 key="receipt"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-white border-4 border-indigo-50 rounded-[40px] p-10 shadow-2xl sticky top-32"
               >
                 <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/20 rotate-3">
                       <CheckCircle2 size={36} />
                    </div>
                    <div>
                       <h4 className="text-3xl font-serif font-black text-slate-900 tracking-tight mb-2">Delivery Active</h4>
                       <p className="text-slate-400 font-medium">Your submission has been securely logged on the EduTrack core.</p>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left space-y-4">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Submission ID</p>
                          <p className="text-slate-900 font-black text-sm uppercase break-all font-mono">{submission.id}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Live Link</p>
                          <a href={submission.driveLink} target="_blank" rel="noreferrer" className="text-indigo-600 font-black text-sm break-all flex items-center gap-1 hover:underline">
                             {submission.driveLink} <ExternalLink size={12} />
                          </a>
                       </div>
                    </div>

                    <div className="pt-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged On</p>
                       <p className="text-slate-900 font-bold">{new Date(submission.submittedAt).toLocaleString()}</p>
                    </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* ── DOUBLE VERIFY MODAL ── */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-[0_40px_100px_rgba(0,0,0,0.3)] relative border border-slate-100"
            >
              <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-inner border border-indigo-100">
                <ShieldCheck size={36} />
              </div>
              <h3 className="text-3xl font-serif font-black text-slate-900 text-center mb-3">Double Check?</h3>
              <p className="text-slate-500 text-center mb-10 text-lg italic leading-relaxed font-medium">Verify that your submission link is correct. This action will be logged on the instructor's dashboard immediately.</p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={executeFinalSubmit}
                  disabled={isSubmitting}
                  className="w-full h-16 bg-indigo-600 hover:bg-slate-900 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Yes, Deploy Solution <Send size={18} /></>}
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  disabled={isSubmitting}
                  className="w-full h-16 bg-slate-50 hover:bg-slate-100 text-slate-500 font-black rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                >
                  Go Back & Edit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default AssignmentDetails;
