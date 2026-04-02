import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { saveAssignment, updateAssignment, getAssignmentById, getCourseById, getCourses } from '../../utils/localStorage';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Send, Link as LinkIcon, FileText, Calendar, Sparkles, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Defined outside component — prevents remount on every keystroke (React identity stays stable)
const InputWrapper = ({ name, focused, children, error }) => (
  <div className={`relative transition-all duration-300 rounded-2xl border ${
    error            ? 'ring-4 ring-rose-50 border-rose-200 bg-rose-50/20'     :
    focused === name ? 'ring-4 ring-indigo-50 border-indigo-200 bg-white shadow-sm' :
    'bg-slate-50 border-slate-200'
  }`}>{children}</div>
);

const CreateAssignment = () => {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { courseId, assignmentId } = useParams();

  // If editing, pre-fill form
  const existing = assignmentId ? getAssignmentById(assignmentId) : null;

  const allCourses   = getCourses();
  const currentCourse = courseId ? getCourseById(courseId) : (existing ? getCourseById(existing.courseId) : null);

  const [formData, setFormData] = useState({
    title:          existing?.title          || '',
    description:    existing?.description    || '',
    driveLink:      existing?.driveLink      || '',
    dueDate:        existing?.dueDate        ? new Date(existing.dueDate).toISOString().split('T')[0] : '',
    submissionType: existing?.submissionType || 'Individual',
    courseId:       existing?.courseId       || courseId || (allCourses[0]?.id ?? ''),
  });

  const [errors,  setErrors]  = useState({});
  const [focused, setFocused] = useState(null);
  const isEditing = !!existing;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim())       newErrors.title       = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.dueDate)            newErrors.dueDate     = 'Due date is required';
    if (formData.driveLink && !/^https?:\/\//.test(formData.driveLink))
      newErrors.driveLink = 'Link must start with http:// or https://';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the form errors.'); return; }

    if (isEditing) {
      updateAssignment({ ...existing, ...formData, dueDate: new Date(formData.dueDate).toISOString() });
      toast.success('Assignment updated!');
    } else {
      saveAssignment({
        id:         `assign_${Date.now()}`,
        createdBy:  user.id,
        createdAt:  new Date().toISOString(),
        ...formData,
        dueDate:    new Date(formData.dueDate).toISOString(),
      });
      toast.success('Assignment published successfully!');
    }
    navigate(formData.courseId ? `/admin/course/${formData.courseId}` : '/admin');
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];


  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto space-y-10 pb-12">

      {/* ── BACK ── */}
      <Link
        to={courseId ? `/admin/course/${courseId}` : '/admin'}
        className="group inline-flex items-center text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-[0.2em]"
      >
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1.5 transition-transform duration-300" />
        {currentCourse ? `Back to ${currentCourse.name}` : 'Back to Hub'}
      </Link>

      {/* ── HEADER ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Sparkles size={14} /></div>
          <span className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px]">
            {isEditing ? 'Edit Assignment' : 'New Assignment'}
          </span>
        </div>
        <h2 className="text-4xl md:text-6xl font-serif font-black text-slate-900 mb-4 tracking-tight leading-tight">
          {isEditing ? 'Edit Task' : 'Create Task'}<span className="text-indigo-600">.</span>
        </h2>
        <p className="text-slate-400 text-lg font-medium italic">
          {isEditing ? 'Update the assignment details below.' : 'Define the next challenge for your classroom.'}
        </p>
      </div>

      {/* ── FORM CARD ── */}
      <div className="bg-white rounded-[40px] p-10 md:p-14 border border-slate-100 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.06)] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-100 to-transparent" />

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">

          {/* Course selector (only shown when no courseId param) */}
          {!courseId && (
            <div className="space-y-3">
              <label htmlFor="courseId" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Course</label>
              <div className="relative rounded-2xl bg-slate-50 border border-slate-200 focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-200 transition-all">
                <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <select id="courseId" name="courseId" value={formData.courseId} onChange={handleChange}
                  className="w-full h-14 pl-12 pr-5 bg-transparent border-0 rounded-2xl outline-none text-slate-900 font-bold">
                  {allCourses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-3">
            <label htmlFor="title" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Task Title</label>
            <InputWrapper name="title" focused={focused} error={errors.title}>
              <Sparkles size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.title ? 'text-rose-500' : focused === 'title' ? 'text-indigo-500' : 'text-slate-300'}`} />
              <input type="text" id="title" name="title" value={formData.title} onChange={handleChange}
                onFocus={() => setFocused('title')} onBlur={() => setFocused(null)}
                placeholder="e.g. Advanced Layouts with Flexbox"
                className="w-full h-14 pl-12 pr-5 bg-transparent border-0 rounded-2xl outline-none text-slate-900 font-bold placeholder:text-slate-200 text-lg tracking-tight" />
            </InputWrapper>
            {errors.title && <p className="ml-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label htmlFor="description" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Instructions</label>
            <div className={`relative transition-all duration-300 rounded-[28px] border ${
              errors.description ? 'ring-4 ring-rose-50 border-rose-200 bg-rose-50/20'
                : focused === 'description' ? 'ring-4 ring-indigo-50 border-indigo-200 bg-white shadow-sm'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <textarea id="description" name="description" rows={6} value={formData.description} onChange={handleChange}
                onFocus={() => setFocused('description')} onBlur={() => setFocused(null)}
                placeholder="Break down exactly what needs to be achieved..."
                className="w-full p-6 bg-transparent border-0 rounded-[28px] outline-none text-slate-900 font-medium placeholder:text-slate-200 text-lg leading-relaxed resize-none" />
            </div>
            {errors.description && <p className="ml-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.description}</p>}
          </div>

          {/* Submission Type */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Submission Type</label>
            <div className="relative flex bg-slate-100/60 rounded-[22px] p-1.5 border border-slate-200/40">
              <motion.div
                layoutId="submission-type-bg"
                className="absolute inset-y-1.5 w-[calc(50%-6px)] rounded-[16px] bg-white shadow-sm border border-slate-100"
                style={{ left: formData.submissionType === 'Individual' ? '6px' : 'calc(50%)' }}
              />
              {[['Individual', User, 'sky'], ['Group', Users, 'violet']].map(([type, Icon, c]) => (
                <button key={type} type="button"
                  onClick={() => setFormData(prev => ({ ...prev, submissionType: type }))}
                  className={`w-1/2 py-3 text-sm font-bold flex items-center justify-center gap-2 relative z-10 transition-all ${
                    formData.submissionType === type ? (c === 'sky' ? 'text-sky-600' : 'text-violet-600') : 'text-slate-400 hover:text-slate-600'
                  }`}>
                  <Icon size={16} /> {type}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline + Drive Link */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="dueDate" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Deadline</label>
              <InputWrapper name="dueDate" focused={focused} error={errors.dueDate}>
                <Calendar size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.dueDate ? 'text-rose-500' : 'text-slate-300'}`} />
                <input type="date" id="dueDate" name="dueDate" min={isEditing ? undefined : minDate}
                  value={formData.dueDate} onChange={handleChange}
                  onFocus={() => setFocused('dueDate')} onBlur={() => setFocused(null)}
                  className="w-full h-14 pl-12 pr-5 bg-transparent border-0 rounded-2xl outline-none text-slate-900 font-bold" />
              </InputWrapper>
              {errors.dueDate && <p className="ml-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.dueDate}</p>}
            </div>

            <div className="space-y-3">
              <label htmlFor="driveLink" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">OneDrive / Submission Link <span className="text-slate-300">(optional)</span></label>
              <InputWrapper name="driveLink" focused={focused} error={errors.driveLink}>
                <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="text" id="driveLink" name="driveLink" value={formData.driveLink} onChange={handleChange}
                  onFocus={() => setFocused('driveLink')} onBlur={() => setFocused(null)}
                  placeholder="Drive, GitHub, or Notion link"
                  className="w-full h-14 pl-12 pr-5 bg-transparent border-0 rounded-2xl outline-none text-slate-900 font-bold placeholder:text-slate-200" />
              </InputWrapper>
              {errors.driveLink && <p className="ml-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.driveLink}</p>}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-50">
            <div className="font-script text-indigo-400 text-2xl rotate-[-2deg] mr-auto">
              {isEditing ? 'Save your changes?' : 'Ready to publish?'}
            </div>
            <motion.button type="submit" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto flex items-center justify-center px-10 h-16 bg-indigo-600 hover:bg-slate-900 text-white font-black rounded-[22px] transition-all shadow-xl shadow-indigo-600/20 hover:-translate-y-1 uppercase tracking-widest text-xs gap-3">
              <Send size={18} /> {isEditing ? 'Save Changes' : 'Launch Assignment'}
            </motion.button>
          </div>
        </form>
      </div>

      <p className="text-center text-slate-300 text-xs font-medium">
        {isEditing ? 'Changes are reflected immediately for all students.' : 'Tasks are instantly visible to all enrolled students upon publication.'}
      </p>
    </motion.div>
  );
};

export default CreateAssignment;
