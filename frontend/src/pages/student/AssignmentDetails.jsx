import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getAssignmentById, saveSubmission, getStudentSubmissions,
  getCourseById, getGroupByStudentAndCourse, acknowledgeForGroup,
  getSubmissions
} from '../../utils/localStorage';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, ExternalLink, CheckCircle2, Clock, Calendar,
  AlertCircle, FileText, Sparkles, ShieldCheck, Users, User,
  Crown, UserX, Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

/* ─── Small Badge ─── */
const Badge = ({ children, className }) => (
  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${className}`}>{children}</span>
);

const AssignmentDetails = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [course,     setCourse]     = useState(null);
  const [group,      setGroup]      = useState(null);
  const [driveLink,  setDriveLink]  = useState('');
  const [showConfirm,setShowConfirm]= useState(false);
  const [isSaving,   setIsSaving]   = useState(false);
  const [focused,    setFocused]    = useState(false);

  const load = useCallback(() => {
    const found = getAssignmentById(id);
    if (!found) { toast.error('Assignment not found'); navigate('/student'); return; }
    setAssignment(found);

    const c = getCourseById(found.courseId);
    setCourse(c);

    const mySubs = getStudentSubmissions(user.id);
    const existing = mySubs.find(s => s.assignmentId === id);
    if (existing) setSubmission(existing);

    if (found.submissionType === 'Group') {
      const g = getGroupByStudentAndCourse(user.id, found.courseId);
      setGroup(g);
    }
  }, [id, user.id, navigate]);

  useEffect(() => { load(); }, [load]);

  /* ─────────── INDIVIDUAL ACKNOWLEDGE ─────────── */
  const handleIndividualAck = () => {
    setIsSaving(true);
    setTimeout(() => {
      const sub = {
        id:            `sub_${Date.now()}`,
        assignmentId:  id,
        studentId:     user.id,
        driveLink:     driveLink.trim(),
        status:        'submitted',
        acknowledged:  true,
        acknowledgedAt: new Date().toISOString(),
        acknowledgedBy: user.id,
      };
      saveSubmission(sub);
      setSubmission(sub);
      setIsSaving(false);
      setShowConfirm(false);
      toast.success('Acknowledged! Your submission has been recorded. ✅');
    }, 1200);
  };

  /* ─────────── GROUP ACKNOWLEDGE (leader only) ─────────── */
  const handleGroupAck = () => {
    if (!group || group.leaderId !== user.id) return;
    setIsSaving(true);
    setTimeout(() => {
      acknowledgeForGroup({
        assignmentId: id,
        memberIds:    group.memberIds,
        leaderId:     user.id,
      });
      // Reload own submission
      const mySubs = getStudentSubmissions(user.id);
      const mine   = mySubs.find(s => s.assignmentId === id);
      setSubmission(mine || null);
      setIsSaving(false);
      setShowConfirm(false);
      toast.success(`Group "${group.name}" acknowledged! All members updated. 🎉`);
    }, 1400);
  };

  if (!assignment) return null;

  const isSubmitted   = !!submission;
  const dueDate       = new Date(assignment.dueDate);
  const isPastDue     = dueDate < new Date() && !isSubmitted;
  const isGroup       = assignment.submissionType === 'Group';
  const isLeader      = isGroup && group?.leaderId === user.id;
  const isMember      = isGroup && group && !isLeader;
  const hasNoGroup    = isGroup && !group;

  // Check if group is already acknowledged (for member view)
  const groupAcknowledged = isGroup && group && (() => {
    const allSubs = getSubmissions();
    return group.memberIds.every(memberId =>
      allSubs.some(s => s.assignmentId === id && s.studentId === memberId && s.status === 'submitted')
    );
  })();

  const handleExecute = () => isGroup ? handleGroupAck() : handleIndividualAck();

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto space-y-10 pb-20 relative">

      {/* ── BACK ── */}
      <Link to={course ? `/student/course/${course.id}` : '/student'}
        className="group inline-flex items-center text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-[0.2em]">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1.5 transition-transform duration-300" />
        {course ? `Back to ${course.name}` : 'Back to Dashboard'}
      </Link>

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <div className={`p-1.5 rounded-lg ${isSubmitted ? 'bg-teal-50 text-teal-600' : 'bg-indigo-50 text-indigo-600'}`}>
              {isSubmitted ? <CheckCircle2 size={14} /> : <Sparkles size={14} />}
            </div>
            <span className={`${isSubmitted ? 'text-teal-600' : 'text-indigo-600'} font-black uppercase tracking-[0.2em] text-[10px]`}>
              {isSubmitted ? 'Acknowledged' : 'Assignment Brief'}
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-black text-slate-900 mb-4 tracking-tighter leading-tight">
            {assignment.title}
          </h2>
          <div className="flex flex-wrap gap-3 mt-4">
            {/* Submission type badge */}
            <Badge className={isGroup ? 'bg-violet-50 text-violet-600 border-violet-100' : 'bg-sky-50 text-sky-600 border-sky-100'}>
              {isGroup ? <><Users size={10} className="inline mr-1" />Group</> : <><User size={10} className="inline mr-1" />Individual</>}
            </Badge>
            {/* Due date */}
            <Badge className="bg-slate-50 text-slate-500 border-slate-100">
              <Calendar size={10} className="inline mr-1" />
              Due {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Badge>
            {/* Course */}
            {course && (
              <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100">{course.code}</Badge>
            )}
            {assignment.driveLink && (
              <a href={assignment.driveLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors">
                <ExternalLink size={10} /> Reference Material
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

      {/* ── MAIN GRID ── */}
      <div className="grid lg:grid-cols-5 gap-10">

        {/* ═══ LEFT: ASSIGNMENT DETAILS ═══ */}
        <div className="lg:col-span-3 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-50 rounded-full blur-[60px] opacity-50 -translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="text-indigo-400" size={18} />
                <h4 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Assignment Description</h4>
                <div className="h-[1px] flex-1 bg-slate-100" />
              </div>
              <p className="text-slate-600 text-lg font-medium leading-relaxed whitespace-pre-wrap">{assignment.description}</p>

              <div className="mt-10 pt-8 border-t border-slate-50 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Posted</p>
                  <p className="text-slate-700 font-bold">{new Date(assignment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Submission Type</p>
                  <p className={`font-bold ${isGroup ? 'text-violet-600' : 'text-sky-600'}`}>{assignment.submissionType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── GROUP STATUS PANEL (group assignments only) ── */}
          {isGroup && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className={`rounded-[28px] p-8 border ${
                hasNoGroup        ? 'bg-amber-50 border-amber-100' :
                groupAcknowledged ? 'bg-teal-50  border-teal-100'  :
                                    'bg-white    border-slate-100 shadow-sm'
              }`}>
              {hasNoGroup ? (
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600 shrink-0"><UserX size={22} /></div>
                  <div>
                    <p className="font-black text-amber-800 mb-1">You are not part of any group.</p>
                    <p className="text-amber-600 text-sm font-medium mb-4">Form or join a group to submit this assignment.</p>
                    <Link to={`/student/course/${assignment.courseId}/groups`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-amber-600/20">
                      <Users size={14} /> Manage Groups
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl ${groupAcknowledged ? 'bg-teal-100 text-teal-600' : 'bg-violet-100 text-violet-600'}`}>
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{group.name}</p>
                      <p className="text-slate-400 text-xs font-medium">{group.memberIds.length} members</p>
                    </div>
                    {isLeader && (
                      <span className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-widest">
                        <Crown size={10} /> Leader
                      </span>
                    )}
                  </div>

                  {isMember && !groupAcknowledged && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 mt-2">
                      <Clock size={16} className="text-blue-400 mt-0.5 shrink-0" />
                      <p className="text-blue-700 text-sm font-medium">
                        Waiting for <strong>{group.memberIds.find(id => id === group.leaderId) ? 'your group leader' : 'the leader'}</strong> to acknowledge on behalf of the group.
                      </p>
                    </div>
                  )}
                  {groupAcknowledged && (
                    <div className="flex items-center gap-3 bg-teal-100 border border-teal-200 rounded-2xl p-4 mt-2">
                      <CheckCircle2 size={18} className="text-teal-600 shrink-0" />
                      <p className="text-teal-700 font-black text-sm">Your group has acknowledged this assignment!</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* ═══ RIGHT: SUBMISSION PANEL ═══ */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              /* ── ACKNOWLEDGED RECEIPT ── */
              <motion.div key="receipt" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white border-4 border-teal-50 rounded-[40px] p-10 shadow-2xl sticky top-32">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-teal-500 rounded-[28px] flex items-center justify-center text-white mx-auto shadow-xl shadow-teal-500/20 rotate-3">
                    <CheckCircle2 size={36} />
                  </div>
                  <div>
                    <h4 className="text-3xl font-serif font-black text-slate-900 tracking-tight mb-2">Acknowledged!</h4>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed">
                      {isGroup && submission.acknowledgedBy !== user.id
                        ? `Recorded by your group leader on behalf of the group.`
                        : 'Your acknowledgment has been logged.'}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Timestamp</p>
                      <p className="text-slate-900 font-bold text-sm">{new Date(submission.acknowledgedAt).toLocaleString()}</p>
                    </div>
                    {submission.driveLink && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Submission Link</p>
                        <a href={submission.driveLink} target="_blank" rel="noreferrer"
                          className="text-indigo-600 font-bold text-sm break-all flex items-center gap-1 hover:underline">
                          {submission.driveLink} <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

            ) : (
              /* ── SUBMISSION PANEL ── */
              <motion.div key="panel" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 rounded-[40px] p-10 shadow-2xl relative overflow-hidden sticky top-32">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10 space-y-7">

                  <div className="text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isGroup ? 'bg-violet-500/20 text-violet-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                      {isGroup ? <Users size={26} /> : <User size={26} />}
                    </div>
                    <h4 className="text-white font-serif font-black text-2xl mb-2 tracking-tight">
                      {isGroup ? (isLeader ? 'Acknowledge for Group' : 'Group Submission') : 'Acknowledge Submission'}
                    </h4>
                    <p className="text-slate-400 font-medium text-sm leading-snug">
                      {isGroup
                        ? (isLeader ? `As group leader, your acknowledgment will apply to all ${group?.memberIds.length} members.` : 'Your group leader must acknowledge this assignment.')
                        : 'Confirm that you have completed and submitted this assignment.'}
                    </p>
                  </div>

                  {/* Optional drive link */}
                  {(!isGroup || isLeader) && !hasNoGroup && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                        Submission Link <span className="text-slate-600 normal-case font-medium">(optional)</span>
                      </label>
                      <div className={`relative rounded-2xl border transition-all duration-300 ${focused ? 'border-indigo-500/50 bg-white/10 ring-4 ring-indigo-500/10' : 'border-white/10 bg-white/5'}`}>
                        <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input type="url" value={driveLink} onChange={e => setDriveLink(e.target.value)}
                          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                          placeholder="https://drive.google.com/..."
                          className="w-full h-14 pl-11 pr-5 bg-transparent border-0 outline-none text-white font-bold placeholder:text-slate-700 rounded-2xl" />
                      </div>
                    </div>
                  )}

                  {/* Overdue warning */}
                  {isPastDue && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex gap-3">
                      <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={18} />
                      <p className="text-rose-200 text-xs font-bold leading-relaxed">This assignment is past its deadline. Late acknowledgments may still be recorded.</p>
                    </div>
                  )}

                  {/* Disabled state for non-leaders in group assignments */}
                  {isGroup && !isLeader && !hasNoGroup && !groupAcknowledged ? (
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
                      <Clock className="text-blue-300 shrink-0" size={18} />
                      <p className="text-blue-200 text-xs font-bold leading-relaxed">
                        Only the group leader can acknowledge. Waiting for <strong className="text-white">{(() => {
                          // get leader name — can't call hooks, use group data
                          return 'the leader';
                        })()}</strong>.
                      </p>
                    </div>
                  ) : hasNoGroup ? (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3">
                      <AlertCircle className="text-amber-300 shrink-0" size={18} />
                      <p className="text-amber-200 text-xs font-bold leading-relaxed">Join a group first to acknowledge this group assignment.</p>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setShowConfirm(true)}
                      disabled={isSaving}
                      className={`w-full h-16 font-black rounded-[22px] transition-all shadow-xl uppercase tracking-widest text-xs flex items-center justify-center gap-3 ${
                        isGroup ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/20' : 'bg-indigo-600 hover:bg-white hover:text-indigo-900 text-white shadow-indigo-600/20'
                      }`}>
                      <ShieldCheck size={20} />
                      {isGroup ? `Yes — Acknowledge for Group` : `Yes, I Have Submitted`}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── DOUBLE VERIFY MODAL ── */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-slate-100">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-[28px] flex items-center justify-center mx-auto mb-8 border border-indigo-100">
                <ShieldCheck size={36} />
              </div>
              <h3 className="text-3xl font-serif font-black text-slate-900 text-center mb-3">Confirm Acknowledgment</h3>
              <p className="text-slate-500 text-center mb-2 text-base italic leading-relaxed font-medium">
                {isGroup
                  ? `You're acknowledging on behalf of all ${group?.memberIds.length} members of "${group?.name}". All members will see this as submitted.`
                  : 'By confirming, you acknowledge that you have completed and submitted this assignment.'}
              </p>
              <p className="text-slate-400 text-center text-sm mb-10">This action will be timestamped and logged immediately.</p>
              <div className="flex flex-col gap-4">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={handleExecute} disabled={isSaving}
                  className="w-full h-16 bg-indigo-600 hover:bg-slate-900 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                  {isSaving
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><CheckCircle2 size={18} /> Yes, Confirm Acknowledgment</>}
                </motion.button>
                <button onClick={() => setShowConfirm(false)} disabled={isSaving}
                  className="w-full h-14 bg-slate-50 hover:bg-slate-100 text-slate-500 font-black rounded-2xl transition-all uppercase tracking-widest text-[10px]">
                  Go Back &amp; Review
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
