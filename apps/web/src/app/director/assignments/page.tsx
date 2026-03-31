'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { PageHeader, Avatar, Badge, SearchBar, Modal } from '@/components/ui';
import { Plus, Calendar, Check, ChevronLeft, ChevronRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Director Assignments — Assign Lessons flow (Figma 37/38/39)        */
/* ------------------------------------------------------------------ */

export default function AssignmentsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const PER_PAGE = 6;

  const reload = () => api.groups.assignments().then(setAssignments).catch(console.error);

  useEffect(() => {
    api.lessons.list().then(setLessons).catch(console.error);
    api.groups.list().then(setGroups).catch(console.error);
    api.users.list('TEACHER').then(setTeachers).catch(console.error);
    reload();
  }, []);

  /* ---------- filtering ---------- */
  const filtered = useMemo(() => {
    if (!search) return assignments;
    const q = search.toLowerCase();
    return assignments.filter(a =>
      a.lesson?.title?.toLowerCase().includes(q) ||
      a.group?.name?.toLowerCase().includes(q) ||
      a.user?.name?.toLowerCase().includes(q)
    );
  }, [assignments, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-8">
      {/* ---- Toast ---- */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#16a34a] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
          <Check size={16} />
          {toast}
        </div>
      )}

      {/* ---- Page Header ---- */}
      <div className="flex items-center justify-between mb-2">
        <PageHeader label="ASSIGNMENTS" title="Lesson Assignments" />
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#00609b] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#004a79] transition-colors"
        >
          <Plus size={16} />
          New Assignment
        </button>
      </div>

      {/* ---- Filters ---- */}
      <div className="flex items-center gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search assignments..." className="w-72" />
      </div>

      {/* ---- Assignment List ---- */}
      <div className="bg-white rounded-[20px] border border-[#e5e7eb] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Lesson</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Assigned To</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Due Date</th>
              <th className="text-center px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((a: any) => (
              <tr key={a.id} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors">
                <td className="px-5 py-3.5">
                  <p className="text-sm font-semibold text-[#181c21]">{a.lesson?.title || 'Lesson'}</p>
                  <p className="text-xs text-[#9ca3af]">{a.lesson?.isMandatory ? 'Mandatory' : 'Optional'}</p>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {a.user && <Avatar name={a.user.name || 'U'} size={28} />}
                    <span className="text-sm text-[#374151]">
                      {a.group ? `Group: ${a.group.name}` : a.user?.name || 'Unknown'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {a.dueDate ? (
                    <div className="flex items-center gap-1.5 text-xs text-[#707882]">
                      <Calendar size={12} />
                      {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  ) : (
                    <span className="text-xs text-[#d1d5db]">No due date</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <Badge variant="inProgress">Assigned</Badge>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-[#9ca3af] text-sm">
                  No assignments yet. Click &ldquo;New Assignment&rdquo; to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filtered.length > PER_PAGE && (
          <div className="flex items-center justify-between px-5 py-3 bg-[#f9fafb] border-t border-[#e5e7eb]">
            <p className="text-xs text-[#9ca3af]">
              Showing {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
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
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5e7eb] disabled:opacity-30">
                <ChevronRight size={16} className="text-[#707882]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---- Assign Modal ---- */}
      <AssignModal
        open={showModal}
        onClose={() => setShowModal(false)}
        lessons={lessons}
        teachers={teachers}
        groups={groups}
        onAssigned={(msg) => {
          setShowModal(false);
          setToast(msg);
          setTimeout(() => setToast(null), 4000);
          reload();
        }}
      />
    </div>
  );
}

/* ================================================================== */
/*  Assign Modal                                                       */
/* ================================================================== */

function AssignModal({
  open, onClose, lessons, teachers, groups, onAssigned,
}: {
  open: boolean;
  onClose: () => void;
  lessons: any[];
  teachers: any[];
  groups: any[];
  onAssigned: (msg: string) => void;
}) {
  const [tab, setTab] = useState<'mandatory' | 'optional'>('mandatory');
  const [search, setSearch] = useState('');
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
  const [assignTo, setAssignTo] = useState<'teacher' | 'group'>('teacher');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigning, setAssigning] = useState(false);

  const mandatory = lessons.filter(l => l.isMandatory);
  const optional = lessons.filter(l => !l.isMandatory);
  const currentList = tab === 'mandatory' ? mandatory : optional;
  const filtered = search
    ? currentList.filter(l => l.title?.toLowerCase().includes(search.toLowerCase()))
    : currentList;

  const toggleLesson = (id: string) => {
    setSelectedLessons(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAssign = async () => {
    if (!selectedTarget || selectedLessons.size === 0) return;
    setAssigning(true);
    try {
      const lessonIds = Array.from(selectedLessons);
      for (let i = 0; i < lessonIds.length; i++) {
        const data: any = { lessonId: lessonIds[i] };
        if (assignTo === 'group') data.groupId = selectedTarget;
        else data.userId = selectedTarget;
        if (dueDate) data.dueDate = new Date(dueDate).toISOString();
        await api.groups.assign(data);
      }
      onAssigned(`${selectedLessons.size} lesson(s) assigned successfully!`);
      setSelectedLessons(new Set());
      setSelectedTarget('');
      setDueDate('');
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Assign Lessons" subtitle="Create a new lesson assignment" maxWidth="520px">
      {/* Assign To */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-[#374151] mb-1.5 block">Assign To</label>
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => { setAssignTo('teacher'); setSelectedTarget(''); }}
            className={`text-xs font-bold px-4 py-1.5 rounded-full transition-colors ${assignTo === 'teacher' ? 'bg-[#1e293b] text-white' : 'bg-[#f3f4f6] text-[#707882]'}`}
          >
            Teacher
          </button>
          <button
            onClick={() => { setAssignTo('group'); setSelectedTarget(''); }}
            className={`text-xs font-bold px-4 py-1.5 rounded-full transition-colors ${assignTo === 'group' ? 'bg-[#1e293b] text-white' : 'bg-[#f3f4f6] text-[#707882]'}`}
          >
            Group
          </button>
        </div>
        <select
          value={selectedTarget}
          onChange={e => setSelectedTarget(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-[#e5e7eb] text-sm text-[#374151] focus:border-[#00609b] outline-none"
        >
          <option value="">Select {assignTo === 'teacher' ? 'a teacher' : 'a group'}</option>
          {assignTo === 'teacher'
            ? teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)
            : groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g._count?.members || 0} members)</option>)
          }
        </select>
      </div>

      {/* Tabs */}
      <div className="flex rounded-full bg-[#f3f4f6] p-1 mb-4">
        <button
          onClick={() => setTab('mandatory')}
          className={`flex-1 text-xs font-bold py-2 rounded-full transition-colors ${tab === 'mandatory' ? 'bg-[#1e293b] text-white' : 'text-[#707882]'}`}
        >
          Mandatory ({mandatory.length})
        </button>
        <button
          onClick={() => setTab('optional')}
          className={`flex-1 text-xs font-bold py-2 rounded-full transition-colors ${tab === 'optional' ? 'bg-[#1e293b] text-white' : 'text-[#707882]'}`}
        >
          Optional ({optional.length})
        </button>
      </div>

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} placeholder="Search lessons..." className="mb-3" />

      {/* Due date */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-[#374151] mb-1.5 block">Set Due Date (Optional)</label>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-[#e5e7eb] text-sm text-[#374151] focus:border-[#00609b] outline-none"
        />
      </div>

      {/* Selection header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-[#707882]">{selectedLessons.size} of {filtered.length} selected</p>
        <button
          onClick={() => {
            if (selectedLessons.size === filtered.length) setSelectedLessons(new Set());
            else setSelectedLessons(new Set(filtered.map(l => l.id)));
          }}
          className="text-xs font-semibold text-[#00609b] hover:underline"
        >
          Select All
        </button>
      </div>

      {/* Warning */}
      {tab === 'mandatory' && (
        <div className="flex items-start gap-2 bg-[#fef3c7] rounded-xl p-3 mb-3">
          <span className="text-red-500 text-sm mt-0.5">&#9888;</span>
          <p className="text-[11px] text-[#92400e]">
            <span className="font-bold">Mandatory Lessons:</span> These lessons will unlock in order. Teachers must complete each one before moving to the next.
          </p>
        </div>
      )}

      {/* Lesson list */}
      <div className="space-y-2 max-h-[240px] overflow-y-auto">
        {filtered.map(lesson => {
          const isChecked = selectedLessons.has(lesson.id);
          return (
            <div
              key={lesson.id}
              onClick={() => toggleLesson(lesson.id)}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isChecked ? 'border-[#00609b] bg-[#eff6ff]' : 'border-[#e5e7eb] hover:border-[#d1d5db]'}`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 ${isChecked ? 'bg-[#00609b] border-[#00609b]' : 'border-[#d1d5db]'}`}>
                {isChecked && <Check size={12} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#181c21]">{lesson.title}</p>
                  <Badge variant={lesson.isMandatory ? 'required' : 'optional'}>
                    {lesson.isMandatory ? 'Required' : 'Optional'}
                  </Badge>
                </div>
                <p className="text-[11px] text-[#9ca3af] mt-0.5">{lesson.description || 'Classroom Management'}</p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center py-4 text-xs text-[#9ca3af]">No lessons found</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#e5e7eb]">
        <button onClick={onClose} className="text-sm font-medium text-[#707882] hover:text-[#374151]">Cancel</button>
        <button
          onClick={handleAssign}
          disabled={selectedLessons.size === 0 || !selectedTarget || assigning}
          className="flex items-center gap-2 bg-[#00609b] hover:bg-[#004a79] text-white text-sm font-bold px-6 py-2.5 rounded-full disabled:opacity-40 transition-colors"
        >
          {assigning ? 'Assigning...' : 'Assign'} <Check size={14} />
        </button>
      </div>
    </Modal>
  );
}
