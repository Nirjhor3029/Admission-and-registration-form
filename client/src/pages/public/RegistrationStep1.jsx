import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import FormHeader from '../../components/FormHeader';
import TopBar from '../../components/TopBar';
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
  const [personNotice, setPersonNotice] = useState(null);
  const lastPersonMobile = useRef('');

  const { register, handleSubmit, watch, setValue, getValues, trigger, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { gender: '', qualification: '', course_id: '', level_id: '', batch_id: '', referral_source: '' },
  });

  const mobileValue = watch('mobile');

  useEffect(() => {
    const m = (mobileValue || '').trim();
    if (!/^01[3-9]\d{8}$/.test(m) || m === lastPersonMobile.current) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await api.get('/registrations/person', { params: { mobile: m } });
        const d = res.data.data;
        if (cancelled || !d?.found || !d.student) return;
        lastPersonMobile.current = m;
        const s = d.student;
        setValue('fullName', s.name || '');
        setValue('email', s.email || '');
        setValue('whatsapp', s.whatsapp || '');
        setValue('gender', s.gender || '');
        setValue('address', s.address || '');
        setValue('qualification', s.qualification || '');
        setValue('referral_source', s.referral_source || '');
        setSameAsMobile(!!s.whatsapp && s.whatsapp === m);
        if (s.photo) {
          setPhotoPreview(s.photo);
          setPhotoFile(null);
        }
        setPersonNotice({ name: s.name || '', mobile: m });
        toast.success(`Welcome back${s.name ? `, ${s.name}` : ''}! Your details were auto-filled.`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // ignore lookup errors; the form still works without prefill
      }
    }, 600);
    return () => { cancelled = true; clearTimeout(t); };
  }, [mobileValue, setValue]);

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
    lastPersonMobile.current = draft.mobile || '';
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
      const d = res.data.data || res.data;
      const app = d.application || {};
      const person = d.student || {};
      persistDraft({ id: app.id || person.id || draftInfo?.id, code: app.draft_code || draftInfo?.code, mobile: data.mobile, name: data.fullName });
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
      const d = res.data.data || res.data;
      const app = d.application || {};
      const person = d.student || d;
      const selectedLevel = levels.find((l) => l._id === data.level_id);
      toast.success('Registration created! Proceed to payment.');
      navigate('/register/step2', {
        state: { applicationId: app.id || person.id || person._id, levelFee: selectedLevel?.fee || '', ...data },
      });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface antialiased relative overflow-x-hidden">
      <TopBar />
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-br from-primary/10 to-transparent -z-10 pointer-events-none" />
      <div className="fixed -top-32 -right-32 w-96 h-96 bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 pointer-events-none" />
      <div className="fixed top-1/4 -left-32 w-80 h-80 bg-tertiary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-30 -z-10 pointer-events-none" />

      {/* Premium Brand Header */}
      <FormHeader/>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop pb-stack-lg relative z-20 -mt-6">
        
        {/* Progress Indicator (Glassmorphism) */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-sm border border-white mb-stack-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">Step 1 of 2</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Personal &amp; Course Info</span>
            </div>
            <div className="w-full bg-surface-variant/50 h-2.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-container h-full rounded-full transition-all duration-700 w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-full animate-shimmer" />
            </div>
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
            <button type="button" onClick={handleDiscard} className="shrink-0 text-on-error-container/60 hover:text-on-error-container">
              <span className="material-symbols-outlined">close</span>
            </button>
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-stack-lg">
          {serverError && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-error-container text-on-error-container rounded-lg border border-error/20">
              <span className="material-symbols-outlined shrink-0 mt-0.5">error</span>
              <p className="text-body-sm md:text-body-md flex-1">{serverError}</p>
              <button type="button" onClick={() => setServerError('')} className="shrink-0 text-on-error-container/60 hover:text-on-error-container">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}
          {personNotice && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-tertiary-container/15 text-on-surface rounded-lg border border-tertiary/30">
              <span className="material-symbols-outlined shrink-0 mt-0.5 text-tertiary">person_pin</span>
              <p className="text-body-sm md:text-body-md flex-1">
                We found your existing profile{personNotice.name ? ` (${personNotice.name})` : ''} on this mobile number.
                Your personal details have been auto-filled. You can update them below if needed.
              </p>
              <button type="button" onClick={() => setPersonNotice(null)} className="shrink-0 text-on-surface-variant/60 hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}

          {/* Section: Personal Info */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-primary/5 border border-white p-margin-mobile md:p-stack-lg transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center gap-3 mb-stack-md pb-4 border-b border-surface-variant">
              <div className="w-10 h-10 rounded-full bg-primary-fixed/50 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">person</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {/* Photo Upload */}
              <div className="col-span-1 md:col-span-2 flex flex-col gap-stack-sm mb-4 bg-surface-container-low/50 p-4 rounded-xl border border-surface-variant/50">
                <label className="premium-label" htmlFor="photo">Profile Photo</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-white border-2 border-dashed border-primary/40 flex items-center justify-center overflow-hidden flex-shrink-0 relative group cursor-pointer transition-all hover:border-primary hover:shadow-md hover:scale-105">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-primary/60 group-hover:text-primary transition-colors text-3xl">add_a_photo</span>
                    )}
                    <input accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" type="file" onChange={handlePhotoChange} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="font-label-md text-label-md text-on-surface mb-1">Upload a clear photo</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">This will be used for your student ID card. Max size: 5MB. Formats: JPG, PNG, WebP, GIF.</span>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="premium-label" htmlFor="fullName">Full Name (as per documents) <span className="text-error">*</span></label>
                <div className="relative group">
                  <input id="fullName" placeholder="e.g. Jane Doe" className="premium-input peer" {...register('fullName')} />
                  <span className="material-symbols-outlined premium-icon">badge</span>
                </div>
                {errors.fullName && <span className="text-body-sm text-error">{errors.fullName.message}</span>}
              </div>

              {/* Mobile Number */}
              <div className="flex flex-col gap-1.5">
                <label className="premium-label" htmlFor="mobile">Mobile Number <span className="text-error">*</span></label>
                <div className="relative">
                  <input id="mobile" placeholder="01XXXXXXXXX" type="tel" className="premium-input peer" {...register('mobile')} />
                  <span className="material-symbols-outlined premium-icon">phone_iphone</span>
                </div>
                {errors.mobile && <span className="text-body-sm text-error">{errors.mobile.message}</span>}
              </div>

              {/* WhatsApp */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="premium-label" htmlFor="whatsapp">WhatsApp Number</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary/50 bg-white"
                      checked={sameAsMobile}
                      onChange={(e) => {
                        setSameAsMobile(e.target.checked);
                        if (e.target.checked) setValue('whatsapp', mobileValue || '');
                      }}
                    />
                    <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary transition-colors">Same as Mobile</span>
                  </label>
                </div>
                <div className="relative">
                  <input id="whatsapp" placeholder="For important updates" type="tel" className="premium-input peer" {...register('whatsapp')} disabled={sameAsMobile} />
                  <span className="material-symbols-outlined premium-icon">chat</span>
                </div>
                {errors.whatsapp && <span className="text-body-sm text-error">{errors.whatsapp.message}</span>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="premium-label" htmlFor="email">Email Address</label>
                <div className="relative">
                  <input id="email" placeholder="jane@example.com" type="email" className="premium-input peer" {...register('email')} />
                  <span className="material-symbols-outlined premium-icon">mail</span>
                </div>
                {errors.email && <span className="text-body-sm text-error">{errors.email.message}</span>}
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-1.5">
                <label className="premium-label" htmlFor="gender">Gender <span className="text-error">*</span></label>
                <div className="relative">
                  <select id="gender" className="premium-input peer appearance-none pr-10 pl-4" {...register('gender')}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">expand_more</span>
                </div>
                {errors.gender && <span className="text-body-sm text-error">{errors.gender.message}</span>}
              </div>

              {/* Address */}
              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5 mt-2">
                <label className="premium-label" htmlFor="address">Current Address</label>
                <textarea id="address" placeholder="Enter your full residential address..." rows="3" className="w-full p-4 border border-outline-variant/60 rounded-xl bg-white/80 font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm resize-y" {...register('address')} />
              </div>
            </div>
          </div>

          {/* Section: Course Details */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-primary/5 border border-white p-margin-mobile md:p-stack-lg transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center gap-3 mb-stack-md pb-4 border-b border-surface-variant">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed-dim/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary-container">library_books</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface">Course Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {/* Qualification */}
              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="premium-label" htmlFor="qualification">Highest Educational Qualification <span className="text-error">*</span></label>
                <div className="relative">
                  <select id="qualification" className="premium-input peer appearance-none pr-10 pl-4" {...register('qualification')}>
                    <option value="">Select Qualification</option>
                    <option value="high_school">High School Diploma</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="phd">Doctorate / PhD</option>
                    <option value="other">Other</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">expand_more</span>
                </div>
                {errors.qualification && <span className="text-body-sm text-error">{errors.qualification.message}</span>}
              </div>

              {/* Course */}
              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="premium-label" htmlFor="course_id">Desired Course <span className="text-error">*</span></label>
                <div className="relative">
                  <select id="course_id" className="premium-input peer appearance-none pr-10 pl-4" value={selectedCourse} onChange={handleCourseChange}>
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
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">expand_more</span>
                </div>
                {errors.course_id && <span className="text-body-sm text-error">{errors.course_id.message}</span>}
              </div>

              {/* Level */}
              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="premium-label" htmlFor="level_id">Program Level <span className="text-error">*</span></label>
                <div className="relative">
                  <select id="level_id" className="premium-input peer appearance-none pr-10 pl-4" value={selectedLevel} onChange={handleLevelChange}>
                    <option value="">Select Level</option>
                    {levels.map((l) => (
                      <option key={l._id} value={l._id}>{l.name} — ৳{l.fee} ({l.duration})</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">expand_more</span>
                </div>
                {errors.level_id && <span className="text-body-sm text-error">{errors.level_id.message}</span>}
              </div>

              {/* Batch */}
              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5">
                <label className="premium-label" htmlFor="batch_id">Preferred Batch <span className="text-label-sm text-on-surface-variant">(Optional)</span></label>
                <div className="relative">
                  <select id="batch_id" className="premium-input peer appearance-none pr-10 pl-4" {...register('batch_id')}>
                    <option value="">Select Batch (optional)</option>
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>{b.batch_name} — {b.class_schedule || ''}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">expand_more</span>
                </div>
                {errors.batch_id && <span className="text-body-sm text-error">{errors.batch_id.message}</span>}
              </div>

              {/* Referral Source */}
              <div className="col-span-1 md:col-span-2 flex flex-col gap-1.5 mt-2">
                <label className="premium-label" htmlFor="referral_source">How did you hear about us?</label>
                <div className="relative">
                  <select id="referral_source" className="premium-input peer appearance-none pr-10 pl-4" {...register('referral_source')}>
                    <option value="">Select Source</option>
                    <option value="facebook_ad">Facebook Ad</option>
                    <option value="facebook_page">Facebook Page</option>
                    <option value="website">Website</option>
                    <option value="friend">Friend / Colleague</option>
                    <option value="youtube">YouTube</option>
                    <option value="other">Other</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions (Sticky on Mobile, Integrated on Desktop) */}
          <div className="sticky bottom-4 md:static md:bottom-auto z-40 bg-white/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none p-4 md:p-0 rounded-2xl md:rounded-none shadow-2xl md:shadow-none border border-outline-variant/20 md:border-none flex flex-col-reverse md:flex-row items-center justify-between gap-4 mt-2">
            <button type="button" onClick={handleSaveDraft} disabled={savingDraft} className="w-full md:w-auto h-14 md:h-12 px-8 rounded-xl font-label-md text-label-md text-primary bg-primary-fixed/30 hover:bg-primary-fixed/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {savingDraft && <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
              {savingDraft ? 'Saving...' : 'Save Draft'}
              {!savingDraft && <span className="material-symbols-outlined text-lg">save</span>}
            </button>
            <button type="submit" disabled={isSubmitting} className="w-full md:w-auto h-14 md:h-12 px-10 rounded-xl font-label-md text-label-md text-white bg-gradient-to-r from-primary to-primary-container hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98] group disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting && <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Next: Payment'}
              {!isSubmitting && <span className="material-symbols-outlined text-xl group-hover:translate-x-1.5 transition-transform">arrow_forward</span>}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 pb-8 font-body-sm text-body-sm text-on-surface-variant/80">
          Need help with your registration? <a className="text-primary hover:text-primary-container transition-colors font-medium underline underline-offset-4" href="#">Contact Support</a>
        </p>
      </main>
    </div>
  );
}