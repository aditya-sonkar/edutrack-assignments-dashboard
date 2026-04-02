import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getCourseById, getGroupsByCourse, getGroupByStudentAndCourse,
  saveGroup, deleteGroup, getUsers
} from '../../utils/localStorage';
import {
  ArrowLeft, Users, UserPlus, LogOut, Crown, Shield, Plus,
  Sparkles, Check, X, AlertCircle, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const GroupManagement = () => {
  const { courseId }  = useParams();
  const { user }      = useAuth();
  const [course,     setCourse]    = useState(null);
  const [allGroups,  setAllGroups] = useState([]);
  const [myGroup,    setMyGroup]   = useState(null);
  const [students,   setStudents]  = useState([]);
  const [newName,    setNewName]   = useState('');
  const [showCreate, setShowCreate]= useState(false);
  const [joiningId,  setJoiningId] = useState(null);
  const [showLeave,  setShowLeave] = useState(false);

  const reload = () => {
    const c = getCourseById(courseId);
    setCourse(c);
    const groups = getGroupsByCourse(courseId);
    setAllGroups(groups);
    setMyGroup(getGroupByStudentAndCourse(user.id, courseId));
    const allStudents = getUsers().filter(u => u.role === 'student');
    setStudents(allStudents);
  };

  useEffect(reload, [courseId, user.id]);

  const handleCreate = () => {
    if (!newName.trim()) return toast.error('Please enter a group name.');
    if (myGroup)         return toast.error('You are already in a group for this course.');
    const newGroup = {
      id:         `grp_${Date.now()}`,
      courseId,
      name:       newName.trim(),
      leaderId:   user.id,
      memberIds:  [user.id],
    };
    saveGroup(newGroup);
    toast.success(`Group "${newGroup.name}" created! You're the leader. 👑`);
    setNewName('');
    setShowCreate(false);
    reload();
  };

  const handleJoin = (group) => {
    if (myGroup) return toast.error('Leave your current group first.');
    const updated = { ...group, memberIds: [...group.memberIds, user.id] };
    saveGroup(updated);
    toast.success(`Joined "${group.name}"!`);
    setJoiningId(null);
    reload();
  };

  const handleLeave = () => {
    if (!myGroup) return;
    if (myGroup.leaderId === user.id) {
      // Leader leaves → dissolve group if they're the only member, else promote next member
      if (myGroup.memberIds.length === 1) {
        deleteGroup(myGroup.id);
        toast.success('Group dissolved (you were the only member).');
      } else {
        const newLeader = myGroup.memberIds.find(id => id !== user.id);
        const updated = {
          ...myGroup,
          leaderId:  newLeader,
          memberIds: myGroup.memberIds.filter(id => id !== user.id),
        };
        saveGroup(updated);
        toast.success('You left the group. Leadership transferred.');
      }
    } else {
      const updated = { ...myGroup, memberIds: myGroup.memberIds.filter(id => id !== user.id) };
      saveGroup(updated);
      toast.success('You left the group.');
    }
    setShowLeave(false);
    reload();
  };

  if (!course) return null;

  const getStudentName = (id) => students.find(s => s.id === id)?.name || 'Unknown';
  const isGroupFull    = (g)  => g.memberIds.length >= students.length;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto space-y-10 pb-12">

      {/* ── BACK ── */}
      <Link to={`/student/course/${courseId}`} className="group inline-flex items-center text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-[0.2em]">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1.5 transition-transform duration-300" />
        Back to {course.name}
      </Link>

      {/* ── HEADER ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600"><Sparkles size={14} /></div>
          <span className="text-violet-600 font-black uppercase tracking-[0.2em] text-[10px]">Group Management</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900 mb-2 tracking-tight leading-tight">
          Study Groups<span className="text-violet-500">.</span>
        </h2>
        <p className="text-slate-400 font-medium italic text-lg">{course.name} — {course.code}</p>
      </div>

      {/* ── MY GROUP STATUS ── */}
      {myGroup ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] border border-violet-100 shadow-sm p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet-50 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 opacity-50" />
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-violet-100 rounded-lg text-violet-600"><Users size={14} /></div>
                  <span className="text-violet-600 font-black uppercase tracking-[0.2em] text-[10px]">Your Group</span>
                </div>
                <h3 className="text-3xl font-serif font-black text-slate-900 tracking-tight">{myGroup.name}</h3>
              </div>
              <div className="flex flex-col items-end gap-2">
                {myGroup.leaderId === user.id ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black uppercase tracking-widest">
                    <Crown size={12} /> Leader
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 text-[10px] font-black uppercase tracking-widest">
                    <Shield size={12} /> Member
                  </span>
                )}
                <button onClick={() => setShowLeave(true)}
                  className="flex items-center gap-1.5 text-rose-400 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest transition-colors">
                  <LogOut size={12} /> Leave Group
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myGroup.memberIds.map(memberId => (
                <div key={memberId} className={`p-4 rounded-2xl border flex items-center gap-3 ${memberId === user.id ? 'bg-violet-50 border-violet-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${memberId === user.id ? 'bg-violet-200 text-violet-700' : 'bg-slate-200 text-slate-600'}`}>
                    {getStudentName(memberId).charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{getStudentName(memberId)}</p>
                    {memberId === myGroup.leaderId && (
                      <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest flex items-center gap-1"><Crown size={8} />Leader</span>
                    )}
                    {memberId === user.id && memberId !== myGroup.leaderId && (
                      <span className="text-[9px] text-violet-500 font-black uppercase tracking-widest">You</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50/50 border border-amber-100 rounded-[28px] p-8 flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0"><AlertCircle size={20} /></div>
          <div>
            <p className="font-black text-amber-800 text-sm mb-1">You are not in any group for this course.</p>
            <p className="text-amber-600 text-sm font-medium">Create a new group or join an existing one to submit group assignments.</p>
          </div>
        </motion.div>
      )}

      {/* ── CREATE GROUP ── */}
      {!myGroup && (
        <div>
          <AnimatePresence>
            {!showCreate ? (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setShowCreate(true)}
                className="w-full py-5 bg-white border-2 border-dashed border-violet-200 rounded-[28px] text-violet-600 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-violet-50 hover:border-violet-300 transition-all">
                <Plus size={18} /> Create New Group
              </motion.button>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                className="bg-white rounded-[28px] border border-violet-100 p-8 shadow-sm">
                <h4 className="text-xl font-serif font-black text-slate-900 mb-6">Name Your Group</h4>
                <div className="flex gap-3">
                  <input
                    type="text" value={newName} onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    placeholder="e.g. Design Titans"
                    className="flex-1 h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-slate-900 font-bold focus:ring-4 focus:ring-violet-50 focus:border-violet-200 transition-all"
                  />
                  <button onClick={handleCreate}
                    className="h-14 px-6 bg-violet-600 hover:bg-slate-900 text-white font-black rounded-2xl transition-all shadow-xl shadow-violet-600/20 flex items-center gap-2 uppercase tracking-widest text-xs">
                    <Check size={18} /> Create
                  </button>
                  <button onClick={() => { setShowCreate(false); setNewName(''); }}
                    className="w-14 h-14 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center transition-all">
                    <X size={18} />
                  </button>
                </div>
                <p className="mt-4 text-slate-400 text-xs font-medium italic">You will be set as the group leader automatically.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── ALL GROUPS ── */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-2xl font-serif font-black text-slate-900">All Groups</h3>
          <span className="bg-white border border-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">{allGroups.length} groups</span>
        </div>

        {allGroups.length === 0 ? (
          <div className="text-center p-16 bg-white rounded-[32px] border border-dashed border-slate-200">
            <Users size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium italic">No groups formed yet. Be the first!</p>
          </div>
        ) : (
          <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }} className="space-y-4">
            {allGroups.map(group => {
              const isMyGroup  = myGroup?.id === group.id;
              const isMember   = group.memberIds.includes(user.id);
              const canJoin    = !myGroup && !isMember && !isGroupFull(group);

              return (
                <motion.div key={group.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } }}
                  className={`bg-white rounded-[24px] border p-6 flex items-center justify-between gap-4 transition-all ${isMyGroup ? 'border-violet-200 shadow-md shadow-violet-100' : 'border-slate-100 shadow-sm'}`}>

                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isMyGroup ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Users size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900">{group.name}</p>
                        {isMyGroup && <span className="px-2 py-0.5 rounded-lg bg-violet-50 text-violet-600 text-[9px] font-black uppercase tracking-widest border border-violet-100">Your Group</span>}
                      </div>
                      <p className="text-slate-400 text-xs font-medium mt-0.5">
                        Leader: <span className="font-bold text-slate-600">{getStudentName(group.leaderId)}</span>
                        {' '}&middot; {group.memberIds.length} member{group.memberIds.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Member avatars */}
                    <div className="flex -space-x-2 hidden sm:flex">
                      {group.memberIds.slice(0, 3).map(id => (
                        <div key={id} title={getStudentName(id)}
                          className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-black ${id === user.id ? 'bg-violet-200 text-violet-700' : 'bg-slate-200 text-slate-600'}`}>
                          {getStudentName(id).charAt(0)}
                        </div>
                      ))}
                      {group.memberIds.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                          +{group.memberIds.length - 3}
                        </div>
                      )}
                    </div>

                    {canJoin ? (
                      joiningId === group.id ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleJoin(group)}
                            className="h-10 px-4 bg-violet-600 hover:bg-slate-900 text-white font-black rounded-xl transition-all text-xs uppercase tracking-widest flex items-center gap-1.5">
                            <Check size={14} /> Confirm
                          </button>
                          <button onClick={() => setJoiningId(null)} className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-all">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setJoiningId(group.id)}
                          className="h-10 px-4 bg-slate-100 hover:bg-violet-50 hover:text-violet-600 text-slate-500 font-black rounded-xl transition-all text-xs uppercase tracking-widest flex items-center gap-1.5">
                          <UserPlus size={14} /> Join
                        </button>
                      )
                    ) : isMember ? (
                      <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-black uppercase tracking-widest">
                        <UserCheck size={15} /> Joined
                      </span>
                    ) : isGroupFull(group) ? (
                      <span className="text-slate-300 text-xs font-black uppercase tracking-widest">Full</span>
                    ) : (
                      <span className="text-slate-300 text-xs font-black uppercase tracking-widest">—</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ── LEAVE CONFIRM MODAL ── */}
      <AnimatePresence>
        {showLeave && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl border border-slate-100">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[28px] flex items-center justify-center mx-auto mb-8 border border-rose-100">
                <LogOut size={36} />
              </div>
              <h3 className="text-3xl font-serif font-black text-slate-900 text-center mb-3">Leave Group?</h3>
              <p className="text-slate-500 text-center mb-10 text-base italic leading-relaxed">
                {myGroup?.leaderId === user.id && myGroup?.memberIds.length > 1
                  ? 'As the leader, leaving will transfer leadership to another member.'
                  : myGroup?.leaderId === user.id
                  ? 'You are the only member — leaving will dissolve this group.'
                  : 'You can rejoin or find another group later.'}
              </p>
              <div className="flex flex-col gap-4">
                <button onClick={handleLeave} className="w-full py-4 bg-rose-600 hover:bg-slate-900 text-white font-black rounded-2xl transition-all text-xs uppercase tracking-widest">
                  Confirm Leave
                </button>
                <button onClick={() => setShowLeave(false)} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all text-xs uppercase tracking-widest">
                  Stay in Group
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GroupManagement;
