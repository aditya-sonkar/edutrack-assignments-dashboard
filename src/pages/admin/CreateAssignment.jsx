import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { saveAssignment } from '../../utils/localStorage';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Send, Link as LinkIcon, FileText, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const CreateAssignment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    driveLink: '',
    dueDate: ''
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    
    if (formData.driveLink && !/^https?:\/\//.test(formData.driveLink)) {
      newErrors.driveLink = 'Link must start with http:// or https://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    const newAssignment = {
      id: `assign_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      driveLink: formData.driveLink,
      createdBy: user.id,
      dueDate: new Date(formData.dueDate).toISOString(),
      createdAt: new Date().toISOString()
    };

    saveAssignment(newAssignment);
    toast.success('Assignment published successfully!');
    navigate('/admin');
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto space-y-10 pb-12">
      
      {/* ── BACK ACTION ── */}
      <Link to="/admin" className="group inline-flex items-center text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-[0.2em] mb-4">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1.5 transition-transform duration-300" /> 
        Back to Hub
      </Link>
      
      {/* ── HEADER ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
           <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles size={14} />
           </div>
           <span className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px]">New Task Protocol</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-serif font-black text-slate-900 mb-4 tracking-tight leading-tight">
           Create Task<span className="text-indigo-600">.</span>
        </h2>
        <p className="text-slate-400 text-lg font-medium italic">Define the next challenge for your classroom.</p>
      </div>
      
      {/* ── FORM CARD ── */}
      <div className="bg-white rounded-[40px] p-10 md:p-14 border border-slate-100 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.06)] relative overflow-hidden group">
         {/* Subtle top glare */}
         <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-100 to-transparent" />
         
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          {/* Title Area */}
          <div className="space-y-3">
            <label htmlFor="title" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
               Task Identity
            </label>
            <div className={`relative transition-all duration-300 rounded-2xl group ${errors.title ? 'ring-4 ring-rose-50 border-rose-200 bg-rose-50/20' : 'bg-slate-50 border-slate-200'}`}>
              <Sparkles size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.title ? 'text-rose-500' : 'text-slate-300'}`} />
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Advanced Layouts with Flexbox"
                className="w-full h-14 pl-12 pr-5 bg-transparent border-0 rounded-2xl outline-none text-slate-900 font-bold placeholder:text-slate-200 text-lg tracking-tight"
              />
            </div>
            {errors.title && <p className="ml-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.title}</p>}
          </div>
          
          {/* Instructions TextArea */}
          <div className="space-y-3">
            <label htmlFor="description" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
               Strategic Instructions
            </label>
            <div className={`relative transition-all duration-300 rounded-[28px] ${errors.description ? 'ring-4 ring-rose-50 border-rose-200 bg-rose-50/20' : 'bg-slate-50 border-slate-200 focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-200'}`}>
              <textarea
                id="description"
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                placeholder="Break down exactly what needs to be achieved..."
                className="w-full p-6 bg-transparent border-0 rounded-[28px] outline-none text-slate-900 font-medium placeholder:text-slate-200 text-lg leading-relaxed resize-none"
              />
            </div>
            {errors.description && <p className="ml-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.description}</p>}
          </div>
          
          {/* Metadata Row */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="dueDate" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                 Final Deadline
              </label>
              <div className={`relative transition-all duration-300 rounded-2xl ${errors.dueDate ? 'ring-4 ring-rose-50 border-rose-200 bg-rose-50/20' : 'bg-slate-50 border-slate-200 focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-200'}`}>
                <Calendar size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.dueDate ? 'text-rose-500' : 'text-slate-300'}`} />
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  min={minDate}
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full h-14 pl-12 pr-5 bg-transparent border-0 rounded-2xl outline-none text-slate-900 font-bold"
                />
              </div>
              {errors.dueDate && <p className="ml-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.dueDate}</p>}
            </div>
            
            <div className="space-y-3">
              <label htmlFor="driveLink" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                 External Assets Link
              </label>
              <div className="relative transition-all duration-300 rounded-2xl bg-slate-50 border border-slate-200 focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-200">
                <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  id="driveLink"
                  name="driveLink"
                  value={formData.driveLink}
                  onChange={handleChange}
                  placeholder="Drive, GitHub, or Notion link"
                  className="w-full h-14 pl-12 pr-5 bg-transparent border-0 rounded-2xl outline-none text-slate-900 font-bold placeholder:text-slate-200"
                />
              </div>
              {errors.driveLink && <p className="ml-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">{errors.driveLink}</p>}
            </div>
          </div>
          
          <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-50 mt-4">
             <div className="font-script text-indigo-400 text-2xl rotate-[-2deg] mr-auto">
               Ready to publish?
             </div>
             <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center px-10 h-16 bg-indigo-600 hover:bg-slate-900 text-white font-black rounded-[22px] transition-all shadow-xl shadow-indigo-600/20 hover:shadow-slate-900/20 hover:-translate-y-1 uppercase tracking-widest text-xs"
              >
                <Send size={18} className="mr-3" /> Launch Assignment
             </button>
          </div>
        </form>
      </div>

      <div className="text-center">
         <p className="text-slate-300 font-medium text-xs">
            Tasks are instantly visible to all enrolled students upon publication.
         </p>
      </div>

    </motion.div>
  );
};

export default CreateAssignment;
