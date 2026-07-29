import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface rounded-xl shadow-xl border border-outline-variant w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <h3 className="text-headline-md text-on-surface">{title}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function CourseManagement() {
  const queryClient = useQueryClient();
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [editLevel, setEditLevel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const courseForm = useState({ name: '', code: '', fee: '', duration: '', description: '' });
  const batchForm = useState({ course_id: '', level_id: '', batch_name: '', start_date: '', capacity: '', class_schedule: '' });
  const levelForm = useState({ course_id: '', name: '', duration: '', fee: '', time_slots: '' });

  const { data } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data.data || r.data.courses || []),
  });
  const courses = Array.isArray(data) ? data : [];
  const filtered = courses.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.code?.toLowerCase().includes(searchTerm.toLowerCase()));

  const createMutation = useMutation({
    mutationFn: (body) => editCourse ? api.patch(`/courses/${editCourse._id}`, body) : api.post('/courses', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['courses'] }); setShowCourseForm(false); setEditCourse(null); },
  });

  const createBatchMutation = useMutation({
    mutationFn: (body) => api.post('/batches', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['courses'] }); setShowBatchForm(false); },
  });

  const createLevelMutation = useMutation({
    mutationFn: ({ courseId, body }) => editLevel
      ? api.put(`/courses/${courseId}/levels/${editLevel._id}`, body)
      : api.post(`/courses/${courseId}/levels`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['courses'] }); setShowLevelForm(false); setEditLevel(null); },
  });

  const deleteLevelMutation = useMutation({
    mutationFn: ({ courseId, levelId }) => api.delete(`/courses/${courseId}/levels/${levelId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  });

  const openEditCourse = (course) => {
    setEditCourse(course);
    courseForm[1]({ name: course.name, code: course.code || '', fee: course.fee?.toString() || '', duration: course.duration || '', description: course.description || '' });
    setShowCourseForm(true);
  };

  const openAddLevel = (courseId) => {
    setEditLevel(null);
    levelForm[1]({ course_id: courseId, name: '', duration: '', fee: '', time_slots: '' });
    setShowLevelForm(true);
  };

  const openEditLevel = (level, courseId) => {
    setEditLevel(level);
    levelForm[1]({
      course_id: courseId,
      name: level.name,
      duration: level.duration || '',
      fee: level.fee?.toString() || '',
      time_slots: Array.isArray(level.time_slots) ? level.time_slots.join(', ') : (level.time_slots || ''),
    });
    setShowLevelForm(true);
  };

  const levelsQuery = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const results = {};
      for (const course of courses) {
        try {
          const res = await api.get(`/courses/${course._id}/levels`);
          results[course._id] = Array.isArray(res.data.data) ? res.data.data : [];
        } catch {
          results[course._id] = [];
        }
      }
      return results;
    },
    enabled: courses.length > 0,
    staleTime: 30000,
  });
  const levelsByCourse = levelsQuery.data || {};

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-xl text-on-surface">Course & Batch Management</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Manage your academic programs, schedules, and enrollments.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setEditCourse(null); courseForm[1]({ name: '', code: '', fee: '', duration: '', description: '' }); setShowCourseForm(true); }} className="h-10 px-4 bg-surface border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-variant transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Course
          </button>
          <button onClick={() => setShowBatchForm(true)} className="h-10 px-4 bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary-container transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Batch
          </button>
        </div>
      </header>

      <div className="relative w-full sm:w-72">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm" placeholder="Search courses..." />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-4">library_books</span>
            <p>No courses found. Add your first course to get started.</p>
          </div>
        )}
        {filtered.map((course) => {
          const courseLevels = levelsByCourse[course._id] || [];
          return (
            <div key={course._id} className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-headline-md text-on-surface">{course.name}</h3>
                  {course.code && <p className="text-body-sm text-on-surface-variant">{course.code}</p>}
                </div>
                <button onClick={() => openEditCourse(course)} className="text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">edit</span>
                </button>
              </div>
              <div className="flex gap-4 mb-4 text-body-sm">
                <span className="text-on-surface-variant">Fee: <strong className="text-on-surface">${course.fee}</strong></span>
                <span className="text-on-surface-variant">Duration: <strong className="text-on-surface">{course.duration}</strong></span>
              </div>

              {courseLevels.length > 0 && (
                <div className="space-y-2 border-t border-outline-variant/30 pt-4 mb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Program Levels</p>
                    <button onClick={() => openAddLevel(course._id)} className="text-label-sm text-primary hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">add</span> Add Level
                    </button>
                  </div>
                  {courseLevels.map((level) => (
                    <div key={level._id} className="flex items-center justify-between py-2 px-3 bg-surface-container-low rounded-lg">
                      <div className="flex-1">
                        <p className="text-body-sm text-on-surface font-medium">{level.name}</p>
                        <p className="text-body-sm text-on-surface-variant">${level.fee} &middot; {level.duration}{level.time_slots?.length ? ` &middot; ${level.time_slots.join(', ')}` : ''}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEditLevel(level, course._id)} className="text-on-surface-variant hover:text-primary p-1">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => { if (confirm('Delete this level?')) deleteLevelMutation.mutate({ courseId: course._id, levelId: level._id }); }} className="text-on-surface-variant hover:text-error p-1">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {courseLevels.length === 0 && (
                <div className="border-t border-outline-variant/30 pt-4 mb-4 flex items-center justify-between">
                  <p className="text-body-sm text-on-surface-variant">No program levels yet</p>
                  <button onClick={() => openAddLevel(course._id)} className="text-label-sm text-primary hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">add</span> Add Level
                  </button>
                </div>
              )}

              {course.batches && course.batches.length > 0 && (
                <div className="space-y-3 border-t border-outline-variant/30 pt-4">
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Batches</p>
                  {course.batches.map((batch) => {
                    const pct = batch.capacity ? Math.min(100, ((batch.seats_filled || 0) / batch.capacity) * 100) : 0;
                    const barColor = pct >= 100 ? 'bg-error' : pct >= 80 ? 'bg-secondary' : 'bg-primary';
                    return (
                      <div key={batch._id} className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <p className="text-body-sm text-on-surface font-medium">{batch.batch_name || batch.name}</p>
                          <p className="text-body-sm text-on-surface-variant">{batch.class_schedule || ''}</p>
                        </div>
                        <div className="w-32 ml-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-on-surface-variant">{batch.seats_filled || 0}/{batch.capacity}</span>
                            <span className={pct >= 100 ? 'text-error' : 'text-on-surface-variant'}>{Math.round(pct)}%</span>
                          </div>
                          <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {(!course.batches || course.batches.length === 0) && (
                <p className="text-body-sm text-on-surface-variant border-t border-outline-variant/30 pt-4">No batches yet</p>
              )}
            </div>
          );
        })}
      </div>

      {showCourseForm && (
        <Modal title={editCourse ? 'Edit Course' : 'Add Course'} onClose={() => { setShowCourseForm(false); setEditCourse(null); }}>
          <form onSubmit={(e) => { e.preventDefault(); const f = courseForm[0]; createMutation.mutate({ name: f.name, code: f.code, fee: Number(f.fee), duration: f.duration, description: f.description }); }} className="flex flex-col gap-4">
            <input placeholder="Course Name" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={courseForm[0].name} onChange={(e) => courseForm[1](p => ({ ...p, name: e.target.value }))} required />
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Code (optional)" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={courseForm[0].code} onChange={(e) => courseForm[1](p => ({ ...p, code: e.target.value }))} />
              <input placeholder="Fee" type="number" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={courseForm[0].fee} onChange={(e) => courseForm[1](p => ({ ...p, fee: e.target.value }))} required />
            </div>
            <input placeholder="Duration (e.g. 4 years)" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={courseForm[0].duration} onChange={(e) => courseForm[1](p => ({ ...p, duration: e.target.value }))} required />
            <textarea placeholder="Description (optional)" rows={3} className="p-3 border border-outline-variant rounded-lg text-body-md resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={courseForm[0].description} onChange={(e) => courseForm[1](p => ({ ...p, description: e.target.value }))} />
            <button type="submit" disabled={createMutation.isPending} className="h-12 bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary-container transition-colors disabled:opacity-50">{editCourse ? 'Update Course' : 'Create Course'}</button>
          </form>
        </Modal>
      )}

      {showLevelForm && (
        <Modal title={editLevel ? 'Edit Level' : 'Add Level'} onClose={() => { setShowLevelForm(false); setEditLevel(null); }}>
          <form onSubmit={(e) => { e.preventDefault(); const f = levelForm[0]; createLevelMutation.mutate({ courseId: f.course_id, body: { name: f.name, duration: f.duration, fee: Number(f.fee), time_slots: f.time_slots ? f.time_slots.split(',').map(s => s.trim()).filter(Boolean) : [] } }); }} className="flex flex-col gap-4">
            <p className="text-body-sm text-on-surface-variant">{courses.find(c => c._id === levelForm[0].course_id)?.name}</p>
            <input placeholder="Level Name (e.g. Workshop, Bootcamp)" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={levelForm[0].name} onChange={(e) => levelForm[1](p => ({ ...p, name: e.target.value }))} required />
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Duration (e.g. 3 months)" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={levelForm[0].duration} onChange={(e) => levelForm[1](p => ({ ...p, duration: e.target.value }))} required />
              <input placeholder="Fee" type="number" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={levelForm[0].fee} onChange={(e) => levelForm[1](p => ({ ...p, fee: e.target.value }))} required />
            </div>
            <input placeholder="Time slots (comma-separated, e.g. Mon-Wed 9AM, Tue-Thu 2PM)" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={levelForm[0].time_slots} onChange={(e) => levelForm[1](p => ({ ...p, time_slots: e.target.value }))} />
            <button type="submit" disabled={createLevelMutation.isPending} className="h-12 bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary-container transition-colors disabled:opacity-50">{editLevel ? 'Update Level' : 'Create Level'}</button>
          </form>
        </Modal>
      )}

      {showBatchForm && (
        <Modal title="Add Batch" onClose={() => setShowBatchForm(false)}>
          <form onSubmit={(e) => { e.preventDefault(); const f = batchForm[0]; createBatchMutation.mutate({ course_id: f.course_id, level_id: f.level_id || undefined, batch_name: f.batch_name, start_date: f.start_date, capacity: Number(f.capacity), class_schedule: f.class_schedule }); }} className="flex flex-col gap-4">
            <select className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={batchForm[0].course_id} onChange={(e) => { batchForm[1](p => ({ ...p, course_id: e.target.value, level_id: '' })); }} required>
              <option value="">Select Course</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={batchForm[0].level_id} onChange={(e) => batchForm[1](p => ({ ...p, level_id: e.target.value }))}>
              <option value="">Select Level (optional)</option>
              {(levelsByCourse[batchForm[0].course_id] || []).map((l) => (
                <option key={l._id} value={l._id}>{l.name}</option>
              ))}
            </select>
            <input placeholder="Batch Name" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={batchForm[0].batch_name} onChange={(e) => batchForm[1](p => ({ ...p, batch_name: e.target.value }))} required />
            <div className="grid grid-cols-2 gap-4">
              <input type="date" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={batchForm[0].start_date} onChange={(e) => batchForm[1](p => ({ ...p, start_date: e.target.value }))} required />
              <input placeholder="Capacity" type="number" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={batchForm[0].capacity} onChange={(e) => batchForm[1](p => ({ ...p, capacity: e.target.value }))} required />
            </div>
            <input placeholder="Class Schedule (e.g. Mon-Wed 9AM)" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={batchForm[0].class_schedule} onChange={(e) => batchForm[1](p => ({ ...p, class_schedule: e.target.value }))} />
            <button type="submit" disabled={createBatchMutation.isPending} className="h-12 bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary-container transition-colors disabled:opacity-50">Create Batch</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
