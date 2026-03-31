'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { PageHeader, Badge, SearchBar, Modal } from '@/components/ui';
import { Plus, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Admin Lessons — matches Figma 40                                   */
/* ------------------------------------------------------------------ */

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const PER_PAGE = 4;

  const reload = () => api.lessons.list().then(setLessons).catch(console.error);
  useEffect(() => { reload(); }, []);

  /* ---------- filtering ---------- */
  const filtered = useMemo(() => {
    let list = lessons;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l => l.title?.toLowerCase().includes(q));
    }
    return list;
  }, [lessons, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* ---------- actions ---------- */
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lesson and all its units?')) return;
    await api.lessons.delete(id);
    reload();
  };

  return (
    <div className="p-8">
      {/* ---- Page Header + Add Button ---- */}
      <div className="flex items-center justify-between mb-2">
        <PageHeader label="LESSONS" title="Lessons library" />
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#00609b] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#004a79] transition-colors"
        >
          <Plus size={16} />
          Add New Lesson
        </button>
      </div>

      {/* ---- Filters ---- */}
      <div className="flex items-center gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search Lessons..." className="w-72" />
        <div className="flex-1" />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="h-9 px-3 pr-8 rounded-full border border-[#e5e7eb] bg-white text-xs font-medium text-[#374151] cursor-pointer outline-none appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          <option value="recent">Sort by: Recently Added</option>
          <option value="name">Sort by: Name</option>
        </select>
      </div>

      {/* ---- Lessons Table ---- */}
      <div className="bg-white rounded-[20px] border border-[#e5e7eb] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider w-20">ID</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Lesson name</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((lesson, idx) => {
              const lessonNum = String((page - 1) * PER_PAGE + idx + 1).padStart(3, '0');
              const isPublished = lesson.status === 'PUBLISHED' || !lesson.status;

              return (
                <tr key={lesson.id} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors">
                  {/* ID */}
                  <td className="px-5 py-3.5 text-sm text-[#707882]">#{lessonNum}</td>

                  {/* Name */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-[#181c21]">{lesson.title}</p>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-[#707882]">{lesson.category || 'Classroom Management'}</p>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <Badge variant={isPublished ? 'active' : 'draft'}>
                      {isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-8 h-8 rounded-lg hover:bg-[#f3f4f6] flex items-center justify-center transition-colors">
                        <Edit2 size={14} className="text-[#707882]" />
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="w-8 h-8 rounded-lg hover:bg-[#fee2e2] flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={14} className="text-[#ef4444]" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[#9ca3af] text-sm">No lessons created yet</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#f9fafb] border-t border-[#e5e7eb]">
          <p className="text-xs text-[#9ca3af]">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} lessons
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5e7eb] disabled:opacity-30">
              <ChevronLeft size={16} className="text-[#707882]" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${page === p ? 'bg-[#00609b] text-white' : 'text-[#707882] hover:bg-[#e5e7eb]'}`}
              >
                {p}
              </button>
            ))}
            {totalPages > 5 && <span className="text-[#9ca3af] text-xs px-1">...</span>}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5e7eb] disabled:opacity-30">
              <ChevronRight size={16} className="text-[#707882]" />
            </button>
          </div>
        </div>
      </div>

      {/* ---- Create Lesson Modal ---- */}
      <CreateLessonModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); reload(); }}
        existingCount={lessons.length}
      />
    </div>
  );
}

/* ================================================================== */
/*  Create Lesson Modal                                                */
/* ================================================================== */

function CreateLessonModal({
  open, onClose, onCreated, existingCount,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  existingCount: number;
}) {
  const [form, setForm] = useState({ title: '', description: '', isMandatory: false });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await api.lessons.create({ ...form, order: existingCount });
      onCreated();
      setForm({ title: '', description: '', isMandatory: false });
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Add New Lesson" maxWidth="480px">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#374151] mb-1.5 block">Lesson Title</label>
          <input
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Setting Clear Expectations"
            className="w-full h-10 px-3 rounded-xl border border-[#e5e7eb] text-sm text-[#374151] focus:border-[#00609b] outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#374151] mb-1.5 block">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description of the lesson"
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-[#e5e7eb] text-sm text-[#374151] focus:border-[#00609b] outline-none resize-none"
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setForm({ ...form, isMandatory: !form.isMandatory })}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${form.isMandatory ? 'bg-[#00609b] border-[#00609b]' : 'border-[#d1d5db]'}`}
          >
            {form.isMandatory && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
            )}
          </div>
          <span className="text-sm text-[#374151]">This is a mandatory lesson</span>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-sm font-medium text-[#707882] hover:text-[#374151]">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={!form.title || creating}
            className="bg-[#00609b] hover:bg-[#004a79] text-white text-sm font-bold px-6 py-2.5 rounded-full disabled:opacity-40 transition-colors"
          >
            {creating ? 'Creating...' : 'Create Lesson'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
