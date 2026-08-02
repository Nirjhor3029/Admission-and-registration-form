import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const generateCodeFromName = (name, existingCodes) => {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  let base = words.map(w => w[0]).join('').toUpperCase().slice(0, 4);
  if (base.length < 2) base = words[0].toUpperCase().slice(0, 3);
  const existing = new Set((existingCodes || []).map(c => String(c || '').toUpperCase()));
  let candidate = base;
  let i = 1;
  while (existing.has(candidate)) {
    candidate = `${base}${i}`;
    i += 1;
  }
  return candidate;
};

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
  const [activeTab, setActiveTab] = useState('courses');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [editLevel, setEditLevel] = useState(null);
  const [editBatch, setEditBatch] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const codeEdited = useRef(false);

  const courseForm = useState({ name: '', code: '', category_id: '', sort_order: '', description: '' });
  const levelForm = useState({ name: '', duration: '', fee: '', sort_order: '', time_slots: '' });
  const batchForm = useState({ course_id: '', level_id: '', batch_name: '', start_date: '', capacity: '', sort_order: '', class_schedule: '' });
  const categoryForm = useState({ name: '', sort_order: '' });

  const { data: categoriesData } = useQuery({
    queryKey: ['course-categories'],
    queryFn: () => api.get('/course-categories').then(r => r.data.data || []),
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data.data.courses || []),
  });
  const courses = Array.isArray(coursesData) ? coursesData : [];

  const { data: levelsData } = useQuery({
    queryKey: ['program-levels'],
    queryFn: () => api.get('/program-levels').then(r => r.data.data || []),
  });
  const levels = Array.isArray(levelsData) ? levelsData : [];

  const { data: batchesData } = useQuery({
    queryKey: ['batches'],
    queryFn: () => api.get('/batches').then(r => r.data.data.batches || []),
  });
  const allBatches = Array.isArray(batchesData) ? batchesData : [];
  const batchesByCourse = {};
  allBatches.forEach(b => {
    const cid = typeof b.course_id === 'object' ? b.course_id._id : b.course_id;
    if (!batchesByCourse[cid]) batchesByCourse[cid] = [];
    batchesByCourse[cid].push(b);
  });

  const createCourseMutation = useMutation({
    mutationFn: (body) => editCourse ? api.patch(`/courses/${editCourse._id}`, body) : api.post('/courses', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['courses'] }); setShowCourseForm(false); setEditCourse(null); },
  });

  const createLevelMutation = useMutation({
    mutationFn: (body) => editLevel ? api.put(`/program-levels/${editLevel._id}`, body) : api.post('/program-levels', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['program-levels'] }); setShowLevelForm(false); setEditLevel(null); },
  });

  const deleteLevelMutation = useMutation({
    mutationFn: (id) => api.delete(`/program-levels/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['program-levels'] }),
  });

  const createBatchMutation = useMutation({
    mutationFn: (body) => editBatch ? api.patch(`/batches/${editBatch._id}`, body) : api.post('/batches', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['batches'] }); queryClient.invalidateQueries({ queryKey: ['courses'] }); setShowBatchForm(false); setEditBatch(null); },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (body) => editCategory ? api.put(`/course-categories/${editCategory._id}`, body) : api.post('/course-categories', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['course-categories'] }); queryClient.invalidateQueries({ queryKey: ['courses'] }); setShowCategoryForm(false); setEditCategory(null); },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => api.delete(`/course-categories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['course-categories'] }); queryClient.invalidateQueries({ queryKey: ['courses'] }); },
  });

  const openAddBatch = () => {
    setEditBatch(null);
    batchForm[1]({ course_id: '', level_id: '', batch_name: '', start_date: '', capacity: '', sort_order: '', class_schedule: '' });
    setShowBatchForm(true);
  };

  const openEditBatch = (batch) => {
    setEditBatch(batch);
    const cid = typeof batch.course_id === 'object' ? batch.course_id._id : batch.course_id;
    batchForm[1]({
      course_id: cid,
      level_id: batch.level_id || '',
      batch_name: batch.batch_name || '',
      start_date: batch.start_date ? batch.start_date.split('T')[0] : '',
      capacity: batch.capacity?.toString() || '',
      sort_order: batch.sort_order?.toString() || '',
      class_schedule: batch.class_schedule || '',
    });
    setShowBatchForm(true);
  };

  const openAddCourse = () => {
    setEditCourse(null);
    codeEdited.current = false;
    const nextOrder = courses.reduce((max, c) => Math.max(max, Number(c.sort_order) || 0), 0) + 1;
    courseForm[1]({ name: '', code: '', category_id: '', sort_order: String(nextOrder), description: '' });
    setShowCourseForm(true);
  };

  const openEditCourse = (course) => {
    setEditCourse(course);
    codeEdited.current = true;
    const cid = typeof course.category_id === 'object' ? course.category_id._id : course.category_id;
    courseForm[1]({ name: course.name, code: course.code || '', category_id: cid || '', sort_order: course.sort_order?.toString() || '', description: course.description || '' });
    setShowCourseForm(true);
  };

  const handleCourseNameChange = (e) => {
    const name = e.target.value;
    courseForm[1](p => ({
      ...p,
      name,
      code: !codeEdited.current ? generateCodeFromName(name, courses.map(c => c.code)) : p.code,
    }));
  };

  const openAddLevel = () => {
    setEditLevel(null);
    levelForm[1]({ name: '', duration: '', fee: '', sort_order: '', time_slots: '' });
    setShowLevelForm(true);
  };

  const openEditLevel = (level) => {
    setEditLevel(level);
    levelForm[1]({
      name: level.name,
      duration: level.duration || '',
      fee: level.fee?.toString() || '',
      sort_order: level.sort_order?.toString() || '',
      time_slots: Array.isArray(level.time_slots) ? level.time_slots.join(', ') : (level.time_slots || ''),
    });
    setShowLevelForm(true);
  };

  const openAddCategory = () => {
    setEditCategory(null);
    const nextOrder = categories.reduce((max, c) => Math.max(max, Number(c.sort_order) || 0), 0) + 1;
    categoryForm[1]({ name: '', sort_order: String(nextOrder) });
    setShowCategoryForm(true);
  };

  const openEditCategory = (category) => {
    setEditCategory(category);
    categoryForm[1]({ name: category.name, sort_order: category.sort_order?.toString() || '' });
    setShowCategoryForm(true);
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const cid = typeof c.category_id === 'object' ? c.category_id._id : c.category_id;
    const matchesCategory = !categoryFilter || cid === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const filteredLevels = levels.filter(l => l.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCategories = categories.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-xl text-on-surface">Course & Batch Management</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Manage your academic programs, schedules, and enrollments.</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'courses' && (
            <button onClick={openAddCourse} className="h-10 px-4 bg-surface border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-variant transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span> Add Course
            </button>
          )}
          {activeTab === 'levels' && (
            <button onClick={openAddLevel} className="h-10 px-4 bg-surface border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-variant transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span> Add Level
            </button>
          )}
          {activeTab === 'categories' && (
            <button onClick={openAddCategory} className="h-10 px-4 bg-surface border border-outline-variant text-on-surface rounded-lg text-label-md hover:bg-surface-variant transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span> Add Category
            </button>
          )}
          <button onClick={openAddBatch} className="h-10 px-4 bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary-container transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Batch
          </button>
        </div>
      </header>

      <div className="flex gap-1 border-b border-outline-variant">
        <button onClick={() => setActiveTab('courses')} className={`px-6 py-3 text-label-md border-b-2 transition-colors ${activeTab === 'courses' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
          Courses
        </button>
        <button onClick={() => setActiveTab('levels')} className={`px-6 py-3 text-label-md border-b-2 transition-colors ${activeTab === 'levels' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
          Program Levels
        </button>
        <button onClick={() => setActiveTab('categories')} className={`px-6 py-3 text-label-md border-b-2 transition-colors ${activeTab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
          Categories
        </button>
      </div>

      <div className="relative w-full sm:w-72">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm" placeholder={activeTab === 'courses' ? 'Search courses...' : activeTab === 'levels' ? 'Search levels...' : 'Search categories...'} />
      </div>

      {activeTab === 'courses' && categories.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">filter_list</span>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 px-3 bg-surface border border-outline-variant rounded-lg text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredCourses.length === 0 && (
            <div className="col-span-full text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-4">library_books</span>
              <p>No courses found. Add your first course to get started.</p>
            </div>
          )}
          {filteredCourses.map((course) => {
            const courseBatches = batchesByCourse[course._id] || [];
            return (
            <div key={course._id} className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-headline-md text-on-surface">{course.name}</h3>
                  <div className="flex items-center gap-2">
                    {course.code && <p className="text-body-sm text-on-surface-variant">{course.code}</p>}
                    {course.category_id && <span className="px-2 py-0.5 bg-surface-container-low text-on-surface-variant text-label-sm rounded-full">{(typeof course.category_id === 'object' ? course.category_id.name : categories.find(c => c._id === course.category_id)?.name) || ''}</span>}
                  </div>
                </div>
                <button onClick={() => openEditCourse(course)} className="text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">edit</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-body-sm">
                {course.sort_order ? <span className="text-on-surface-variant">Order: <strong className="text-on-surface">{course.sort_order}</strong></span> : null}
              </div>
              {courseBatches.length > 0 && (
                <div className="space-y-3 border-t border-outline-variant/30 pt-4">
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Batches</p>
                  {courseBatches.map((batch) => {
                    const pct = batch.capacity ? Math.min(100, ((batch.seats_filled || 0) / batch.capacity) * 100) : 0;
                    const barColor = pct >= 100 ? 'bg-error' : pct >= 80 ? 'bg-secondary' : 'bg-primary';
                    return (
                      <div key={batch._id} className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <p className="text-body-sm text-on-surface font-medium">{batch.batch_name || batch.name}</p>
                          <p className="text-body-sm text-on-surface-variant">{batch.class_schedule || ''}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-on-surface-variant">{batch.seats_filled || 0}/{batch.capacity}</span>
                              <span className={pct >= 100 ? 'text-error' : 'text-on-surface-variant'}>{Math.round(pct)}%</span>
                            </div>
                            <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <button onClick={() => openEditBatch(batch)} className="text-on-surface-variant hover:text-primary">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {courseBatches.length === 0 && (
                <p className="text-body-sm text-on-surface-variant border-t border-outline-variant/30 pt-4">No batches yet</p>
              )}
            </div>
            );
          })}
        </div>
      )}

      {activeTab === 'levels' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredLevels.length === 0 && (
            <div className="col-span-full text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-4">layers</span>
              <p>No program levels found. Add your first level to get started.</p>
            </div>
          )}
          {filteredLevels.map((level) => (
            <div key={level._id} className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-headline-md text-on-surface">{level.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditLevel(level)} className="text-on-surface-variant hover:text-primary">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button onClick={() => { if (confirm('Delete this level?')) deleteLevelMutation.mutate(level._id); }} className="text-on-surface-variant hover:text-error">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-body-sm">
                <span className="text-on-surface-variant">Fee: <strong className="text-on-surface">৳{level.fee}</strong></span>
                <span className="text-on-surface-variant">Duration: <strong className="text-on-surface">{level.duration}</strong></span>
                {level.sort_order ? <span className="text-on-surface-variant">Order: <strong className="text-on-surface">{level.sort_order}</strong></span> : null}
              </div>
              {level.time_slots?.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t border-outline-variant/30 pt-4">
                  {level.time_slots.map((slot, i) => (
                    <span key={i} className="px-3 py-1 bg-surface-container-low text-body-sm rounded-full">{slot}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredCategories.length === 0 && (
            <div className="col-span-full text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-4">category</span>
              <p>No categories found. Add your first category to get started.</p>
            </div>
          )}
          {filteredCategories.map((category) => {
            const count = courses.filter(c => (typeof c.category_id === 'object' ? c.category_id._id : c.category_id) === category._id).length;
            return (
              <div key={category._id} className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-headline-md text-on-surface">{category.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditCategory(category)} className="text-on-surface-variant hover:text-primary">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button onClick={() => { if (confirm('Delete this category? Courses under it will become uncategorized.')) deleteCategoryMutation.mutate(category._id); }} className="text-on-surface-variant hover:text-error">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-body-sm">
                  <span className="text-on-surface-variant">{count} course{count === 1 ? '' : 's'}</span>
                  {category.sort_order ? <span className="text-on-surface-variant">Order: <strong className="text-on-surface">{category.sort_order}</strong></span> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCourseForm && (
        <Modal title={editCourse ? 'Edit Course' : 'Add Course'} onClose={() => { setShowCourseForm(false); setEditCourse(null); codeEdited.current = false; }}>
          <form onSubmit={(e) => { e.preventDefault(); const f = courseForm[0]; createCourseMutation.mutate({ name: f.name, code: f.code || generateCodeFromName(f.name, courses.map(c => c.code)), category_id: f.category_id || undefined, sort_order: f.sort_order ? Number(f.sort_order) : 0, description: f.description }); }} className="flex flex-col gap-4">
            <input placeholder="Course Name" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={courseForm[0].name} onChange={handleCourseNameChange} required />
            <select className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={courseForm[0].category_id} onChange={(e) => courseForm[1](p => ({ ...p, category_id: e.target.value }))}>
              <option value="">Select Category (optional)</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <input placeholder="Course Code" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={courseForm[0].code} onChange={(e) => { codeEdited.current = true; courseForm[1](p => ({ ...p, code: e.target.value.toUpperCase() })); }} />
                <span className="text-body-sm text-on-surface-variant">Auto-generated from name, editable</span>
              </div>
              <input placeholder="Sort Order" type="number" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={courseForm[0].sort_order} onChange={(e) => courseForm[1](p => ({ ...p, sort_order: e.target.value }))} />
            </div>
            <textarea placeholder="Description (optional)" rows={3} className="p-3 border border-outline-variant rounded-lg text-body-md resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={courseForm[0].description} onChange={(e) => courseForm[1](p => ({ ...p, description: e.target.value }))} />
            <button type="submit" disabled={createCourseMutation.isPending} className="h-12 bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary-container transition-colors disabled:opacity-50">{editCourse ? 'Update Course' : 'Create Course'}</button>
          </form>
        </Modal>
      )}

      {showLevelForm && (
        <Modal title={editLevel ? 'Edit Level' : 'Add Level'} onClose={() => { setShowLevelForm(false); setEditLevel(null); }}>
          <form onSubmit={(e) => { e.preventDefault(); const f = levelForm[0]; createLevelMutation.mutate({ name: f.name, duration: f.duration, fee: Number(f.fee), sort_order: f.sort_order ? Number(f.sort_order) : 0, time_slots: f.time_slots ? f.time_slots.split(',').map(s => s.trim()).filter(Boolean) : [] }); }} className="flex flex-col gap-4">
            <input placeholder="Level Name (e.g. Workshop, Bootcamp)" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={levelForm[0].name} onChange={(e) => levelForm[1](p => ({ ...p, name: e.target.value }))} required />
            <div className="grid grid-cols-3 gap-4">
              <input placeholder="Duration" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={levelForm[0].duration} onChange={(e) => levelForm[1](p => ({ ...p, duration: e.target.value }))} required />
              <input placeholder="Fee" type="number" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={levelForm[0].fee} onChange={(e) => levelForm[1](p => ({ ...p, fee: e.target.value }))} required />
              <input placeholder="Sort Order" type="number" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={levelForm[0].sort_order} onChange={(e) => levelForm[1](p => ({ ...p, sort_order: e.target.value }))} />
            </div>
            <input placeholder="Time slots (comma-separated, e.g. Mon-Wed 9AM, Tue-Thu 2PM)" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={levelForm[0].time_slots} onChange={(e) => levelForm[1](p => ({ ...p, time_slots: e.target.value }))} />
            <button type="submit" disabled={createLevelMutation.isPending} className="h-12 bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary-container transition-colors disabled:opacity-50">{editLevel ? 'Update Level' : 'Create Level'}</button>
          </form>
        </Modal>
      )}

      {showCategoryForm && (
        <Modal title={editCategory ? 'Edit Category' : 'Add Category'} onClose={() => { setShowCategoryForm(false); setEditCategory(null); }}>
          <form onSubmit={(e) => { e.preventDefault(); const f = categoryForm[0]; createCategoryMutation.mutate({ name: f.name, sort_order: f.sort_order ? Number(f.sort_order) : 0 }); }} className="flex flex-col gap-4">
            <input placeholder="Category Name (e.g. Artificial Intelligence)" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={categoryForm[0].name} onChange={(e) => categoryForm[1](p => ({ ...p, name: e.target.value }))} required />
            <input placeholder="Sort Order" type="number" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={categoryForm[0].sort_order} onChange={(e) => categoryForm[1](p => ({ ...p, sort_order: e.target.value }))} />
            <button type="submit" disabled={createCategoryMutation.isPending} className="h-12 bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary-container transition-colors disabled:opacity-50">{editCategory ? 'Update Category' : 'Create Category'}</button>
          </form>
        </Modal>
      )}

      {showBatchForm && (
        <Modal title={editBatch ? 'Edit Batch' : 'Add Batch'} onClose={() => { setShowBatchForm(false); setEditBatch(null); }}>
          <form onSubmit={(e) => { e.preventDefault(); const f = batchForm[0]; createBatchMutation.mutate({ course_id: f.course_id, level_id: f.level_id || undefined, batch_name: f.batch_name, start_date: f.start_date, capacity: Number(f.capacity), sort_order: f.sort_order ? Number(f.sort_order) : 0, class_schedule: f.class_schedule }); }} className="flex flex-col gap-4">
            <select className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={batchForm[0].course_id} onChange={(e) => { batchForm[1](p => ({ ...p, course_id: e.target.value, level_id: '' })); }} required>
              <option value="">Select Course</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={batchForm[0].level_id} onChange={(e) => batchForm[1](p => ({ ...p, level_id: e.target.value }))}>
              <option value="">Select Level (optional)</option>
              {levels.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
            </select>
            <input placeholder="Batch Name" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={batchForm[0].batch_name} onChange={(e) => batchForm[1](p => ({ ...p, batch_name: e.target.value }))} required />
            <div className="grid grid-cols-2 gap-4">
              <input type="date" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={batchForm[0].start_date} onChange={(e) => batchForm[1](p => ({ ...p, start_date: e.target.value }))} required />
              <input placeholder="Capacity" type="number" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={batchForm[0].capacity} onChange={(e) => batchForm[1](p => ({ ...p, capacity: e.target.value }))} required />
              <input placeholder="Sort Order" type="number" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={batchForm[0].sort_order} onChange={(e) => batchForm[1](p => ({ ...p, sort_order: e.target.value }))} />
            </div>
            <input placeholder="Class Schedule (e.g. Mon-Wed 9AM)" className="h-12 px-3 border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={batchForm[0].class_schedule} onChange={(e) => batchForm[1](p => ({ ...p, class_schedule: e.target.value }))} />
            <button type="submit" disabled={createBatchMutation.isPending} className="h-12 bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary-container transition-colors disabled:opacity-50">{editBatch ? 'Update Batch' : 'Create Batch'}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
