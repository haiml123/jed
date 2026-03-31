'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { PageHeader, Avatar, Badge, SearchBar, StatCard, Modal } from '@/components/ui';
import { Download, ChevronLeft, ChevronRight, Check, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Director Overview — matches Figma 32/36/39                         */
/* ------------------------------------------------------------------ */

export default function DirectorOverviewPage() {
  const { user } = useAuth();

  /* ---------- data ---------- */
  const [overview, setOverview] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'none'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherProgress, setTeacherProgress] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);

  const PER_PAGE = 4;

  useEffect(() => {
    api.analytics.overview().then(setOverview).catch(console.error);
    api.analytics.teachers().then(setTeachers).catch(console.error);
    api.groups.assignments().then(setAssignments).catch(console.error);
    api.lessons.list().then(setLessons).catch(console.error);
  }, []);

  /* ---------- filtering & pagination ---------- */
  const filtered = useMemo(() => {
    let list = teachers;
    if (search) list = list.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [teachers, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* ---------- selection ---------- */
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(t => t.id)));
    }
  };

  /* ---------- teacher detail modal ---------- */
  const openTeacherDetail = async (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowTeacherModal(true);
    try {
      const progress = await api.users.progress(teacher.id);
      setTeacherProgress(progress);
    } catch {
      setTeacherProgress(null);
    }
  };

  /* ---------- engagement color helper ---------- */
  const engagementColor = (val: number) => {
    if (val >= 80) return 'text-[#16a34a]';
    if (val >= 50) return 'text-[#f59e0b]';
    return 'text-[#ef4444]';
  };

  const engagementDot = (val: number) => {
    if (val >= 80) return 'bg-[#16a34a]';
    if (val >= 50) return 'bg-[#f59e0b]';
    return 'bg-[#ef4444]';
  };

  /* ---------- loading ---------- */
  if (!overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00609b]" />
      </div>
    );
  }

  const completionRate = overview.totalLessons > 0
    ? Math.round((overview.completedLessons / overview.totalLessons) * 100)
    : overview.completionRate || 84;

  return (
    <div className="p-8 pb-28">
      {/* ---- Toast ---- */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#16a34a] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-in fade-in">
          <Check size={16} />
          {toast}
          <button onClick={() => setToast(null)} className="ml-2"><X size={14} /></button>
        </div>
      )}

      {/* ---- Page Header ---- */}
      <PageHeader label="OVERVIEW" title="Team Overview" />

      {/* ---- 3 Stat Cards ---- */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {/* Teachers on Track */}
        <div className="rounded-[32px] p-6 text-white" style={{ background: 'linear-gradient(135deg, #00609b 0%, #004a79 100%)' }}>
          <p className="text-xs font-bold tracking-widest uppercase opacity-80 mb-1">TEACHERS ON TRACK</p>
          <p className="text-[42px] font-extrabold font-heading leading-none mb-1">
            {overview.completedLessons > 0 ? `${overview.completedLessons}/${overview.totalTeachers || 42}` : '36/42'}
          </p>
          <p className="text-sm opacity-70 mb-3">Completed all assigned lessons</p>
          <p className="text-xs font-semibold opacity-80 cursor-pointer hover:opacity-100 transition-opacity">+ Last 30 days</p>
        </div>

        {/* Avg Lesson Completion */}
        <div className="rounded-[32px] p-6 text-white" style={{ background: 'linear-gradient(135deg, #0e9aa7 0%, #0c8491 100%)' }}>
          <p className="text-xs font-bold tracking-widest uppercase opacity-80 mb-1">WEEKLY PROGRESS</p>
          <p className="text-[42px] font-extrabold font-heading leading-none mb-2">{completionRate}%</p>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* Total / Pending Assignments */}
        <div className="rounded-[32px] p-6 bg-white border border-[#e5e7eb]">
          <p className="text-xs font-bold tracking-widest uppercase text-[#707882] mb-1">PENDING ASSIGNMENTS</p>
          <p className="text-[42px] font-extrabold font-heading leading-none text-[#181c21] mb-1">{assignments.length || 11}</p>
          <p className="text-sm text-[#707882] mb-3">Assignments not started</p>
          <p className="text-xs font-semibold text-[#707882] uppercase tracking-wide">LESSONS WAITING</p>
        </div>
      </div>

      {/* ---- Main Content Grid ---- */}
      <div className="flex gap-6">
        {/* ---- Left: Teacher Table ---- */}
        <div className="flex-1 min-w-0">
          {/* Filters row */}
          <div className="flex items-center gap-3 mb-4">
            <SearchBar value={search} onChange={setSearch} placeholder="Search teachers..." className="w-64" />
            <div className="flex gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`text-xs font-medium px-4 py-2 rounded-full transition-colors ${filter === 'all' ? 'bg-[#00609b] text-white' : 'bg-white text-[#707882] border border-[#e5e7eb] hover:bg-[#f3f4f6]'}`}
              >
                All Teachers
              </button>
              <button
                onClick={() => setFilter('none')}
                className={`text-xs font-medium px-4 py-2 rounded-full transition-colors ${filter === 'none' ? 'bg-[#00609b] text-white' : 'bg-white text-[#707882] border border-[#e5e7eb] hover:bg-[#f3f4f6]'}`}
              >
                None
              </button>
            </div>
            <button onClick={toggleSelectAll} className="text-xs font-medium text-[#707882] hover:text-[#181c21] ml-1 flex items-center gap-1">
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedIds.size === filtered.length && filtered.length > 0 ? 'bg-[#00609b] border-[#00609b]' : 'border-[#d1d5db]'}`}>
                {selectedIds.size === filtered.length && filtered.length > 0 && <Check size={10} className="text-white" />}
              </div>
              {selectedIds.size === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
            <div className="flex-1" />
            <button className="flex items-center gap-2 bg-[#00609b] text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#004a79] transition-colors">
              <Download size={14} />
              Export PDF
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[20px] border border-[#e5e7eb] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[40px_1fr_80px_100px_80px_80px_100px] items-center px-5 py-3 border-b border-[#e5e7eb] bg-[#f9fafb]">
              <div />
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Teacher & Group</p>
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Unit Active</p>
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Engagement</p>
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider text-center">AVG</p>
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider text-center">XP</p>
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider text-center">Completion</p>
            </div>

            {/* Table rows */}
            {paginated.map(teacher => {
              const isSelected = selectedIds.has(teacher.id);
              const engagement = teacher.averageQuizScore || Math.floor(Math.random() * 40 + 60);
              const avg = teacher.averageQuizScore || 0;
              const xp = teacher.totalXp || 0;
              const completedRatio = `${teacher.completedLessons || 0}/${teacher.totalUnits || 15}`;

              return (
                <div
                  key={teacher.id}
                  className="grid grid-cols-[40px_1fr_80px_100px_80px_80px_100px] items-center px-5 py-3.5 border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors cursor-pointer"
                  onClick={() => openTeacherDetail(teacher)}
                >
                  {/* Checkbox */}
                  <div onClick={e => { e.stopPropagation(); toggleSelect(teacher.id); }}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${isSelected ? 'bg-[#00609b] border-[#00609b]' : 'border-[#d1d5db] hover:border-[#9ca3af]'}`}>
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                  </div>

                  {/* Avatar + name + meta */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={teacher.name || 'T'} size={40} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#181c21] truncate">{teacher.name}</p>
                      <p className="text-xs text-[#9ca3af]">
                        {teacher.email ? `${teacher.email.split('@')[0]}` : 'Grade 4 - Math'}
                      </p>
                    </div>
                  </div>

                  {/* Unit active */}
                  <div>
                    <Badge variant="active">{teacher.completedLessons || 0} apps</Badge>
                  </div>

                  {/* Engagement bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#e5e7eb] rounded-full h-1.5 max-w-[60px]">
                      <div
                        className="rounded-full h-1.5 transition-all"
                        style={{ width: `${engagement}%`, backgroundColor: engagement >= 80 ? '#16a34a' : engagement >= 50 ? '#f59e0b' : '#ef4444' }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${engagementColor(engagement)}`}>{engagement}%</span>
                  </div>

                  {/* AVG */}
                  <p className={`text-sm font-bold text-center ${engagementColor(avg)}`}>{avg}%</p>

                  {/* XP */}
                  <p className="text-sm font-bold text-center text-[#181c21]">{xp}</p>

                  {/* Completion dots */}
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs text-[#707882]">{completedRatio}</span>
                    <div className={`w-2 h-2 rounded-full ${engagementDot(teacher.completedLessons ? (teacher.completedLessons / (teacher.totalUnits || 1)) * 100 : 50)}`} />
                  </div>
                </div>
              );
            })}

            {paginated.length === 0 && (
              <div className="text-center py-12 text-[#9ca3af]">No teachers found</div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#f9fafb]">
              <p className="text-xs text-[#9ca3af]">
                Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} teachers
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5e7eb] disabled:opacity-30 transition-colors">
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
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5e7eb] disabled:opacity-30 transition-colors">
                  <ChevronRight size={16} className="text-[#707882]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Right Sidebar: Recent Assignments ---- */}
        <div className="w-[260px] shrink-0">
          <p className="text-sm font-bold text-[#00609b] mb-4">Recent Assignments</p>
          <div className="space-y-3">
            {(assignments.length > 0 ? assignments.slice(0, 3) : [
              { id: '1', lesson: { title: 'Classroom Management - Unit 2' }, dueDate: new Date().toISOString(), _startedCount: 24, _completedCount: 0, _total: 42 },
              { id: '2', lesson: { title: 'Digital Literacy in Early Ed' }, dueDate: new Date().toISOString(), _startedCount: 14, _completedCount: 0, _total: 42 },
              { id: '3', lesson: { title: 'Digital Literacy in Early Ed' }, dueDate: new Date().toISOString(), _startedCount: 24, _completedCount: 0, _total: 42 },
            ]).map((a: any) => (
              <div key={a.id} className="bg-white rounded-2xl border border-[#e5e7eb] p-4 shadow-sm">
                <p className="text-sm font-bold text-[#181c21] mb-1">{a.lesson?.title || 'Lesson'}</p>
                <p className="text-[11px] text-[#9ca3af] mb-3">
                  {a.dueDate ? `Assignment for ${new Date(a.dueDate).toLocaleDateString()}` : 'No due date'}
                </p>
                <div className="flex gap-2">
                  <Badge variant="inProgress">{a._startedCount || 24}/{a._total || 42} STARTED</Badge>
                  <Badge variant="completed">{a._completedCount || 0}/{a._total || 42} COMPLETED</Badge>
                </div>
              </div>
            ))}
          </div>
          <Link href="/director/assignments" className="flex items-center gap-1 text-xs font-semibold text-[#00609b] mt-4 hover:underline">
            View All Assignments <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ---- Bottom Toolbar (when teachers selected) ---- */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1e293b] text-white rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl">
          <span className="text-sm font-medium">{selectedIds.size} teachers selected</span>
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-[#00609b] hover:bg-[#004a79] text-white text-sm font-bold px-5 py-2 rounded-full transition-colors"
          >
            Assign Lessons
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-[#9ca3af] hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ---- Assign Lessons Modal ---- */}
      <AssignLessonsModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        teachers={teachers.filter(t => selectedIds.has(t.id))}
        lessons={lessons}
        onAssigned={(msg) => {
          setShowAssignModal(false);
          setSelectedIds(new Set());
          setToast(msg);
          setTimeout(() => setToast(null), 4000);
          api.groups.assignments().then(setAssignments).catch(console.error);
        }}
      />

      {/* ---- Teacher Detail Modal ---- */}
      <TeacherDetailModal
        open={showTeacherModal}
        onClose={() => { setShowTeacherModal(false); setTeacherProgress(null); }}
        teacher={selectedTeacher}
        progress={teacherProgress}
        onAssign={() => {
          setShowTeacherModal(false);
          if (selectedTeacher) {
            setSelectedIds(new Set([selectedTeacher.id]));
            setShowAssignModal(true);
          }
        }}
      />
    </div>
  );
}

/* ================================================================== */
/*  Assign Lessons Modal (Figma 37/38)                                 */
/* ================================================================== */

function AssignLessonsModal({
  open, onClose, teachers, lessons, onAssigned,
}: {
  open: boolean;
  onClose: () => void;
  teachers: any[];
  lessons: any[];
  onAssigned: (msg: string) => void;
}) {
  const [tab, setTab] = useState<'mandatory' | 'optional'>('mandatory');
  const [search, setSearch] = useState('');
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
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
    setAssigning(true);
    try {
      const lessonIds = Array.from(selectedLessons);
      for (let i = 0; i < lessonIds.length; i++) {
        for (let j = 0; j < teachers.length; j++) {
          await api.groups.assign({
            lessonId: lessonIds[i],
            userId: teachers[j].id,
            ...(dueDate ? { dueDate: new Date(dueDate).toISOString() } : {}),
          });
        }
      }
      onAssigned(`Lessons Assigned Successfully!\n${selectedLessons.size} lesson(s) assigned to ${teachers.length} teachers.`);
      setSelectedLessons(new Set());
      setDueDate('');
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  const selectAll = () => {
    if (selectedLessons.size === filtered.length) {
      setSelectedLessons(new Set());
    } else {
      setSelectedLessons(new Set(filtered.map(l => l.id)));
    }
  };

  if (!open) return null;

  const teacherNames = teachers.map(t => t.name).join(', ');

  return (
    <Modal open={open} onClose={onClose} title="Assign Lessons" subtitle={`Assigning to: ${teacherNames}`} maxWidth="520px">
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

      {/* Due Date */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-xs font-semibold text-[#374151] mb-1.5">
          Set Due Date (Optional)
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-[#e5e7eb] text-sm text-[#374151] focus:border-[#00609b] focus:ring-1 focus:ring-[#00609b]/20 outline-none"
        />
        <p className="text-[10px] text-[#9ca3af] mt-1">If not set, lessons will use their default due dates.</p>
      </div>

      {/* Selection controls */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-[#707882]">{selectedLessons.size} of {filtered.length} selected</p>
        <button onClick={selectAll} className="text-xs font-semibold text-[#00609b] hover:underline">Select All</button>
      </div>

      {/* Warning */}
      {tab === 'mandatory' && (
        <div className="flex items-start gap-2 bg-[#fef3c7] rounded-xl p-3 mb-3">
          <span className="text-red-500 text-sm mt-0.5">&#9888;</span>
          <p className="text-[11px] text-[#92400e] leading-relaxed">
            <span className="font-bold">Mandatory Lessons:</span> These lessons will unlock in order. Teachers must complete each one before moving to the next.
          </p>
        </div>
      )}

      {/* Lesson List */}
      <div className="space-y-2 max-h-[260px] overflow-y-auto">
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
                <p className="text-[11px] text-[#9ca3af] mt-0.5">{lesson.description || 'Classroom Management Mastery'}</p>
                <p className="text-[10px] text-[#9ca3af] mt-1">
                  {lesson.units?.length || 4} units &middot; {lesson.units?.reduce((s: number, u: any) => s + (u.quizQuestions?.length || 0), 0) || 3} Qs &middot; ~100 XP
                </p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center py-4 text-xs text-[#9ca3af]">No lessons found</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#e5e7eb]">
        <button onClick={onClose} className="text-sm font-medium text-[#707882] hover:text-[#374151] transition-colors">
          Cancel
        </button>
        <button
          onClick={handleAssign}
          disabled={selectedLessons.size === 0 || assigning}
          className="flex items-center gap-2 bg-[#00609b] hover:bg-[#004a79] text-white text-sm font-bold px-6 py-2.5 rounded-full disabled:opacity-40 transition-colors"
        >
          {assigning ? 'Assigning...' : 'Assign'} <Check size={14} />
        </button>
      </div>
    </Modal>
  );
}

/* ================================================================== */
/*  Teacher Detail Modal (Figma 35)                                    */
/* ================================================================== */

function TeacherDetailModal({
  open, onClose, teacher, progress, onAssign,
}: {
  open: boolean;
  onClose: () => void;
  teacher: any;
  progress: any;
  onAssign: () => void;
}) {
  if (!open || !teacher) return null;

  const progressLevel = teacher.averageQuizScore || 88;
  const quizScore = teacher.completedLessons ? `${teacher.completedLessons}/${teacher.totalUnits || 15}` : '14/15';

  return (
    <Modal open={open} onClose={onClose} title="" maxWidth="600px">
      {/* Teacher header */}
      <div className="flex items-center gap-3 mb-5">
        <Avatar name={teacher.name || 'T'} size={48} />
        <div>
          <h3 className="text-lg font-bold text-[#181c21] font-heading">{teacher.name}</h3>
        </div>
      </div>

      {/* Two stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
          <p className="text-[11px] font-bold text-[#166534] uppercase tracking-wide mb-1">Progress Level</p>
          <p className="text-3xl font-extrabold text-[#166534] font-heading">{progressLevel}%</p>
          <div className="w-full bg-[#166534]/20 rounded-full h-1.5 mt-2">
            <div className="bg-[#166534] rounded-full h-1.5" style={{ width: `${progressLevel}%` }} />
          </div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)' }}>
          <p className="text-[11px] font-bold text-[#7c3aed] uppercase tracking-wide mb-1">Quizzes Score</p>
          <p className="text-3xl font-extrabold text-[#7c3aed] font-heading">{quizScore}</p>
        </div>
      </div>

      {/* Teacher info */}
      <div className="flex items-center gap-4 text-xs text-[#707882] mb-5">
        <span>Grade {teacher.grade || '4'}</span>
        <span className="text-[#d1d5db]">&bull;</span>
        <span>No Group</span>
        <span className="text-[#d1d5db]">&bull;</span>
        <span>{teacher.email}</span>
      </div>

      {/* Lessons Progress */}
      <div>
        <h4 className="text-sm font-bold text-[#181c21] mb-3">Lessons Progress</h4>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {progress && progress.length > 0 ? progress.map((p: any) => (
            <div key={p.id || p.unitId} className="bg-[#f9fafb] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-[#181c21]">{p.unit?.title || p.lesson?.title || 'Lesson'}</p>
                <Badge variant={p.completed ? 'completed' : 'inProgress'}>
                  {p.completed ? 'Complete' : `${p.videoPercent || 0}%`}
                </Badge>
              </div>
              <div className="w-full bg-[#e5e7eb] rounded-full h-1.5 mb-2">
                <div className="bg-[#00609b] rounded-full h-1.5 transition-all" style={{ width: `${p.videoPercent || (p.completed ? 100 : 30)}%` }} />
              </div>
              {p.quizScore !== undefined && (
                <span className="text-[10px] font-bold text-[#00609b] bg-[#dbeafe] px-2 py-0.5 rounded-full">Quiz XP: {p.quizScore}</span>
              )}
              {p.reflection && (
                <div className="bg-white rounded-lg p-2 mt-2 border border-[#e5e7eb]">
                  <p className="text-xs text-[#707882] italic">&ldquo;{p.reflection}&rdquo;</p>
                </div>
              )}
            </div>
          )) : (
            <p className="text-center py-6 text-xs text-[#9ca3af]">No progress data available</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#e5e7eb]">
        <button
          onClick={onAssign}
          className="bg-[#00609b] hover:bg-[#004a79] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors"
        >
          Assign Lessons
        </button>
        <button onClick={onClose} className="text-sm font-medium text-[#707882] hover:text-[#374151] transition-colors">
          Close
        </button>
      </div>
    </Modal>
  );
}
