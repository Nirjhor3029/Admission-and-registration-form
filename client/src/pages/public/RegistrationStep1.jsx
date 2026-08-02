import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  mobile: z.string().min(1, 'Mobile number is required').regex(/^01[3-9]\d{8}$/, 'Enter a valid 11-digit mobile number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  gender: z.string().min(1, 'Gender is required'),
  address: z.string().optional().or(z.literal('')),
  qualification: z.string().min(1, 'Qualification is required'),
  course_id: z.string().min(1, 'Course is required'),
  level_id: z.string().min(1, 'Program level is required'),
  batch_id: z.string().optional().or(z.literal('')),
  referral_source: z.string().optional().or(z.literal('')),
});

export default function RegistrationStep1() {
  const navigate = useNavigate();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [sameAsMobile, setSameAsMobile] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [serverError, setServerError] = useState('');
  const [draftInfo, setDraftInfo] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [resumeQuery, setResumeQuery] = useState('');
  const [resumeError, setResumeError] = useState('');
  const [resuming, setResuming] = useState(false);

  const { register, handleSubmit, watch, setValue, getValues, trigger, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { gender: '', qualification: '', course_id: '', level_id: '', batch_id: '', referral_source: '' },
  });

  const mobileValue = watch('mobile');

  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data.data.courses || []),
  });
  const courses = Array.isArray(coursesData) ? coursesData : [];

  const { data: categoriesData } = useQuery({
    queryKey: ['course-categories'],
    queryFn: () => api.get('/course-categories').then(r => r.data.data || []),
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const { data: levelsData } = useQuery({
    queryKey: ['program-levels'],
    queryFn: () => api.get('/program-levels').then(r => r.data.data || []),
  });
  const levels = Array.isArray(levelsData) ? levelsData : [];

  const { data: batchesData } = useQuery({
    queryKey: ['batches', selectedCourse, selectedLevel],
    queryFn: () => api.get(`/batches?course_id=${selectedCourse}&level_id=${selectedLevel}`).then(r => r.data.data.batches || []),
    enabled: !!selectedCourse && !!selectedLevel,
  });
  const batches = Array.isArray(batchesData) ? batchesData : [];

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const DRAFT_KEY = 'fars_draft';
  const didLoadDraft = useRef(false);

  useEffect(() => {
    if (didLoadDraft.current) return;
    didLoadDraft.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setDraftInfo(JSON.parse(raw));
    } catch {
      // ignore corrupt localStorage draft
    }
  }, []);

  useEffect(() => {
    if (!draftInfo?.code) return;
    let cancelled = false;
    (async () => {
      try {
        const q = draftInfo.code || draftInfo.mobile;
        const res = await api.get(`/registrations/draft?q=${encodeURIComponent(q)}`);
        const draft = res.data.data?.draft;
        if (!cancelled && draft) prefillDraft(draft);
      } catch {
        if (!cancelled) {
          localStorage.removeItem(DRAFT_KEY);
          setDraftInfo(null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [draftInfo?.code]);

  const persistDraft = (info) => {
    setDraftInfo(info);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(info));
  };

  const prefillDraft = (draft) => {
    setValue('fullName', draft.student_name || '');
    setValue('mobile', draft.mobile || '');
    setValue('email', draft.email || '');
    setValue('whatsapp', draft.whatsapp || '');
    setValue('gender', draft.gender || '');
    setValue('address', draft.address || '');
    setValue('qualification', draft.qualification || '');
    setValue('course_id', draft.course_id?._id || draft.course_id || '');
    setValue('level_id', draft.level_id?._id || draft.level_id || '');
    setValue('batch_id', draft.batch_id?._id || draft.batch_id || '');
    setValue('referral_source', draft.referral_source || '');
    setSelectedCourse(draft.course_id?._id || draft.course_id || '');
    setSelectedLevel(draft.level_id?._id || draft.level_id || '');
    setSameAsMobile(!!draft.whatsapp && draft.whatsapp === draft.mobile);
    setPhotoFile(null);
    setPhotoPreview(draft.student_photo_url || null);
    persistDraft({ id: draft._id, code: draft.draft_code, mobile: draft.mobile, name: draft.student_name });
    toast.success(`Draft ${draft.draft_code || ''} restored!`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveDraft = async () => {
    const valid = await trigger(['fullName', 'mobile']);
    if (!valid) {
      toast.error('Name and a valid mobile number are required to save a draft.');
      return;
    }
    const data = getValues();
    setSavingDraft(true);
    setServerError('');
    try {
      const formData = new FormData();
      formData.append('student_name', data.fullName);
      formData.append('mobile', data.mobile);
      formData.append('email', data.email || '');
      formData.append('whatsapp', data.whatsapp || '');
      formData.append('gender', data.gender || '');
      formData.append('address', data.address || '');
      formData.append('qualification', data.qualification || '');
      formData.append('course_id', data.course_id || '');
      formData.append('level_id', data.level_id || '');
      formData.append('batch_id', data.batch_id || '');
      formData.append('referral_source', data.referral_source || '');
      if (draftInfo?.id) formData.append('draft_id', draftInfo.id);
      if (photoFile) formData.append('student_photo', photoFile);

      const res = await api.post('/registrations/draft', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const student = res.data.data?.student || res.data.data;
      persistDraft({ id: student.id || student._id, code: student.draft_code, mobile: data.mobile, name: data.fullName });
      navigate('/register/draft-saved');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Could not save draft. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleResume = async (e) => {
    e?.preventDefault();
    const q = resumeQuery.trim();
    if (!q) {
      setResumeError('Enter your mobile number or draft code.');
      return;
    }
    setResuming(true);
    setResumeError('');
    try {
      const res = await api.get(`/registrations/draft?q=${encodeURIComponent(q)}`);
      const draft = res.data.data?.draft;
      if (draft) prefillDraft(draft);
      setResumeOpen(false);
      setResumeQuery('');
    } catch (err) {
      setResumeError(err.response?.data?.message || 'Draft not found.');
    } finally {
      setResuming(false);
    }
  };

  const handleDiscard = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraftInfo(null);
    setResumeQuery('');
    toast('Draft discarded. You can start fresh.');
  };

  const handleCourseChange = (e) => {
    const val = e.target.value;
    setSelectedCourse(val);
    setSelectedLevel('');
    setValue('course_id', val);
    setValue('level_id', '');
    setValue('batch_id', '');
  };

  const handleLevelChange = (e) => {
    const val = e.target.value;
    setSelectedLevel(val);
    setValue('level_id', val);
    setValue('batch_id', '');
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('student_name', data.fullName);
    formData.append('mobile', data.mobile);
    formData.append('email', data.email || '');
    formData.append('whatsapp', data.whatsapp || '');
    formData.append('gender', data.gender);
    formData.append('address', data.address || '');
    formData.append('qualification', data.qualification);
    formData.append('course_id', data.course_id);
    formData.append('level_id', data.level_id);
    formData.append('batch_id', data.batch_id);
    formData.append('referral_source', data.referral_source || '');
    if (draftInfo?.id) formData.append('draft_id', draftInfo.id);
    if (photoFile) formData.append('student_photo', photoFile);

    try {
      setServerError('');
      const res = await api.post('/registrations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const student = res.data.data?.student || res.data.student || res.data.data;
      const selectedLevel = levels.find((l) => l._id === data.level_id);
      toast.success('Registration created! Proceed to payment.');
      navigate('/register/step2', {
        state: { studentId: student?.id || student?._id, levelFee: selectedLevel?.fee || '', ...data },
      });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-container-low antialiased">
      <header className="w-full bg-surface-container-lowest border-b border-outline-variant px-4 md:px-10 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          <span className="text-headline-md font-bold text-primary tracking-tight">FARS</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="text-label-sm uppercase tracking-wider hidden md:block">Cancel</span>
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-10 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-label-md text-primary">Step 1 of 2</span>
            <span className="text-label-sm text-on-surface-variant">Personal & Course Info</span>
          </div>
          <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full w-1/2" />
          </div>
        </div>

        {draftInfo && (
          <div className="mb-4 flex items-center justify-between gap-3 p-4 bg-primary-container/30 text-on-primary-container rounded-lg border border-primary/20">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">draft</span>
              <div>
                <p className="text-body-sm font-medium">
                  Draft saved: <span className="font-bold">{draftInfo.code || draftInfo.id}</span>
                </p>
                <p className="text-body-sm text-on-surface-variant">Click "Next: Payment" to submit, or "Save Draft" to update.</p>
              </div>
            </div>
            <button type="button" onClick={handleDiscard} className="shrink-0 text-label-sm text-error hover:underline">Discard</button>
          </div>
        )}

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setResumeOpen((v) => !v)}
            className="flex items-center gap-2 text-label-md text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            Resume a saved draft?
          </button>
          {resumeOpen && (
            <form onSubmit={handleResume} className="mt-3 p-4 bg-surface-container-lowest border border-outline-variant rounded-lg">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={resumeQuery}
                  onChange={(e) => setResumeQuery(e.target.value)}
                  placeholder="Enter mobile number or draft code (e.g. DRF-XXXXXX)"
                  className="flex-1 h-11 px-3 border border-outline-variant rounded-md bg-surface-container-lowest text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
                <button type="submit" disabled={resuming} className="h-11 px-6 rounded-md bg-primary text-on-primary text-label-md disabled:opacity-50">
                  {resuming ? 'Searching...' : 'Resume'}
                </button>
              </div>
              {resumeError && <p className="mt-2 text-body-sm text-error">{resumeError}</p>}
            </form>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-surface-container-lowest rounded-xl shadow-[0_10px_25px_-5px_rgba(0,53,95,0.05)] border border-outline-variant/30 p-4 md:p-8">
          {serverError && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-error-container text-on-error-container rounded-lg border border-error/20">
              <span className="material-symbols-outlined shrink-0 mt-0.5">error</span>
              <p className="text-body-sm md:text-body-md flex-1">{serverError}</p>
              <button type="button" onClick={() => setServerError('')} className="shrink-0 text-on-error-container/60 hover:text-on-error-container">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}
          <div className="mb-8">
            <h2 className="text-headline-md text-on-surface mb-4 flex items-center gap-2 border-b border-surface-variant pb-2">
              <span className="material-symbols-outlined text-primary/70">person</span>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2 flex flex-col gap-2 mb-2">
                <label className="text-label-sm text-on-surface-variant">Profile Photo</label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-full bg-surface-container border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden flex-shrink-0 relative group cursor-pointer transition-colors hover:border-primary">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-3xl">add_a_photo</span>
                    )}
                    <input accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" type="file" onChange={handlePhotoChange} />
                  </div>
                  <div className="flex flex-col justify-center pt-2">
                    <span className="text-label-md text-on-surface">Upload a clear photo</span>
                    <span className="text-body-sm text-on-surface-variant max-w-xs mt-1">This will be used for your student ID card. Max size: 5MB. Formats: JPG, PNG, WebP, GIF.</span>
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant" htmlFor="fullName">Full Name (as per documents) <span className="text-error">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">badge</span>
                  <input id="fullName" placeholder="e.g. Jane Doe" className={`w-full h-12 pl-10 pr-3 border ${errors.fullName ? 'border-error' : 'border-outline-variant'} rounded-md bg-surface-container-lowest text-body-md text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm`} {...register('fullName')} />
                </div>
                {errors.fullName && <span className="text-body-sm text-error">{errors.fullName.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant" htmlFor="mobile">Mobile Number <span className="text-error">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">phone_iphone</span>
                  <input id="mobile" placeholder="01XXXXXXXXX" type="tel" className={`w-full h-12 pl-10 pr-3 border ${errors.mobile ? 'border-error' : 'border-outline-variant'} rounded-md bg-surface-container-lowest text-body-md text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm`} {...register('mobile')} />
                </div>
                {errors.mobile && <span className="text-body-sm text-error">{errors.mobile.message}</span>}
              </div>

              

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-label-sm text-on-surface-variant" htmlFor="whatsapp">WhatsApp Number</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary/50 bg-surface-container-lowest"
                      checked={sameAsMobile}
                      onChange={(e) => {
                        setSameAsMobile(e.target.checked);
                        if (e.target.checked) setValue('whatsapp', mobileValue || '');
                      }}
                    />
                    <span className="text-label-sm text-on-surface-variant group-hover:text-primary transition-colors">Same as Mobile</span>
                  </label>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">chat</span>
                  <input id="whatsapp" placeholder="For important updates" type="tel" className="w-full h-12 pl-10 pr-3 border border-outline-variant rounded-md bg-surface-container-lowest text-body-md text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" {...register('whatsapp')} disabled={sameAsMobile} />
                </div>
                {errors.whatsapp && <span className="text-body-sm text-error">{errors.whatsapp.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">mail</span>
                  <input id="email" placeholder="jane@example.com" type="email" className="w-full h-12 pl-10 pr-3 border border-outline-variant rounded-md bg-surface-container-lowest text-body-md text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" {...register('email')} />
                </div>
                {errors.email && <span className="text-body-sm text-error">{errors.email.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant" htmlFor="gender">Gender <span className="text-error">*</span></label>
                <div className="relative">
                  <select id="gender" className={`w-full h-12 pl-3 pr-10 border ${errors.gender ? 'border-error' : 'border-outline-variant'} rounded-md bg-surface-container-lowest text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm`} {...register('gender')}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    {/* <option value="prefer_not_to_say">Prefer not to say</option> */}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
                {errors.gender && <span className="text-body-sm text-error">{errors.gender.message}</span>}
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5 mt-2">
                <label className="text-label-sm text-on-surface-variant" htmlFor="address">Current Address</label>
                <textarea id="address" placeholder="Enter your full residential address..." rows="3" className="w-full p-3 border border-outline-variant rounded-md bg-surface-container-lowest text-body-md text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm resize-y" {...register('address')} />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-headline-md text-on-surface mb-4 flex items-center gap-2 border-b border-surface-variant pb-2">
              <span className="material-symbols-outlined text-primary/70">library_books</span>
              Course Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant" htmlFor="qualification">Highest Educational Qualification <span className="text-error">*</span></label>
                <div className="relative">
                  <select id="qualification" className={`w-full h-12 pl-3 pr-10 border ${errors.qualification ? 'border-error' : 'border-outline-variant'} rounded-md bg-surface-container-lowest text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm`} {...register('qualification')}>
                    <option value="">Select Qualification</option>
                    <option value="high_school">High School Diploma</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="phd">Doctorate / PhD</option>
                    <option value="other">Other</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
                {errors.qualification && <span className="text-body-sm text-error">{errors.qualification.message}</span>}
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant" htmlFor="course_id">Desired Course <span className="text-error">*</span></label>
                <div className="relative">
                  <select id="course_id" className={`w-full h-12 pl-3 pr-10 border ${errors.course_id ? 'border-error' : 'border-outline-variant'} rounded-md bg-surface-container-lowest text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm`} value={selectedCourse} onChange={handleCourseChange}>
                    <option value="">Select Course</option>
                    {categories.map((cat) => {
                      const catCourses = courses.filter(c => (typeof c.category_id === 'object' ? c.category_id._id : c.category_id) === cat._id);
                      if (!catCourses.length) return null;
                      return (
                        <optgroup key={cat._id} label={cat.name}>
                          {catCourses.map((c) => (
                            <option key={c._id} value={c._id}>{c.name || c.title}</option>
                          ))}
                        </optgroup>
                      );
                    })}
                    {(() => {
                      const uncategorized = courses.filter(c => {
                        const cid = typeof c.category_id === 'object' ? c.category_id._id : c.category_id;
                        return !cid || !categories.some(cat => cat._id === cid);
                      });
                      if (!uncategorized.length) return null;
                      return (
                        <optgroup label="Other">
                          {uncategorized.map((c) => (
                            <option key={c._id} value={c._id}>{c.name || c.title}</option>
                          ))}
                        </optgroup>
                      );
                    })()}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
                {errors.course_id && <span className="text-body-sm text-error">{errors.course_id.message}</span>}
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant" htmlFor="level_id">Program Level <span className="text-error">*</span></label>
                <div className="relative">
                  <select id="level_id" className={`w-full h-12 pl-3 pr-10 border ${errors.level_id ? 'border-error' : 'border-outline-variant'} rounded-md bg-surface-container-lowest text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm`} value={selectedLevel} onChange={handleLevelChange}>
                    <option value="">Select Level</option>
                    {levels.map((l) => (
                      <option key={l._id} value={l._id}>{l.name} — ৳{l.fee} ({l.duration})</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
                {errors.level_id && <span className="text-body-sm text-error">{errors.level_id.message}</span>}
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant" htmlFor="batch_id">Preferred Batch <span className="text-label-sm text-on-surface-variant">(Optional)</span></label>
                <div className="relative">
                  <select id="batch_id" className={`w-full h-12 pl-3 pr-10 border ${errors.batch_id ? 'border-error' : 'border-outline-variant'} rounded-md bg-surface-container-lowest text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm`} {...register('batch_id')}>
                    <option value="">Select Batch (optional)</option>
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>{b.batch_name} — {b.class_schedule || ''}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
                {errors.batch_id && <span className="text-body-sm text-error">{errors.batch_id.message}</span>}
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant" htmlFor="referral_source">How did you hear about us?</label>
                <div className="relative">
                  <select id="referral_source" className="w-full h-12 pl-3 pr-10 border border-outline-variant rounded-md bg-surface-container-lowest text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm" {...register('referral_source')}>
                    <option value="">Select Source</option>
                    <option value="facebook_ad">Facebook Ad</option>
                    <option value="facebook_page">Facebook Page</option>
                    <option value="website">Website</option>
                    <option value="friend">Friend / Colleague</option>
                    <option value="youtube">YouTube</option>
                    <option value="other">Other</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-variant mt-4 flex flex-col-reverse md:flex-row items-center justify-end gap-4">
            <button type="button" onClick={handleSaveDraft} disabled={savingDraft} className="w-full md:w-auto h-12 px-6 rounded-lg text-label-md text-primary bg-transparent hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {savingDraft && <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
              {savingDraft ? 'Saving...' : 'Save Draft'}
              {!savingDraft && <span className="material-symbols-outlined text-lg">save</span>}
            </button>
            <button type="submit" disabled={isSubmitting} className="w-full md:w-auto h-12 px-8 rounded-lg text-label-md text-on-primary bg-primary hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-md flex items-center justify-center gap-2 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting && <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Next: Payment'}
              {!isSubmitting && <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
          </div>
        </form>

        <p className="text-center mt-4 text-body-sm text-on-surface-variant">
          Need help with your registration? <a className="text-primary hover:underline font-medium" href="#">Contact Support</a>
        </p>
      </main>
    </div>
  );
}
