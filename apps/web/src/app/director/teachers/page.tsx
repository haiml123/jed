'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader, Avatar, Badge, SearchBar, Modal } from '@/components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Director Teacher Overview — matches Figma 35                       */
/*  Shows teacher list with clickable rows that open detail modal      */
/* ------------------------------------------------------------------ */

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [teacherProgress, setTeacherProgress] = useState<any>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  useEffect(() => {
    api.analytics.teachers().then(setTeachers).catch(console.error);
  }, []);

  /* ---------- search ---------- */
  const filtered = search
    ? teachers.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) || t.email?.toLowerCase().includes(search.toLowerCase()))
    : teachers;

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* ---------- open detail modal ---------- */
  const openDetail = async (teacher: any) => {
    setSelectedTeacher(teacher);
    try {
      const progress = await api.users.progress(teacher.id);
      setTeacherProgress(progress);
    } catch {
      setTeacherProgress(null);
    }
  };

  const closeDetail = () => {
    setSelectedTeacher(null);
    setTeacherProgress(null);
  };

  return (
    <div className="p-8">
      {/* ---- Page Header ---- */}
      <PageHeader label="TEACHERS" title="Teacher Overview" />

      {/* ---- Filters ---- */}
      <div className="flex items-center gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." className="w-72" />
      </div>

      {/* ---- Table ---- */}
      <div className="bg-white rounded-[20px] border border-[#e5e7eb] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Teacher</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Email</th>
              <th className="text-center px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">XP</th>
              <th className="text-center px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Completed</th>
              <th className="text-center px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Avg Score</th>
              <th className="text-center px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(t => {
              const scoreColor = t.averageQuizScore >= 80 ? '#166534' : t.averageQuizScore >= 50 ? '#92400e' : '#dc2626';
              const scoreBg = t.averageQuizScore >= 80 ? '#dcfce7' : t.averageQuizScore >= 50 ? '#fef9c3' : '#fee2e2';

              return (
                <tr
                  key={t.id}
                  onClick={() => openDetail(t)}
                  className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={t.name || 'T'} size={36} />
                      <span className="text-sm font-semibold text-[#181c21]">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#707882]">{t.email}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="text-sm font-bold text-[#00609b]">{t.totalXp || 0}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="text-sm text-[#374151]">{t.completedLessons || 0}/{t.totalUnits || 0}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className="inline-block text-xs font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: scoreBg, color: scoreColor }}
                    >
                      {t.averageQuizScore || 0}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge variant={t.completedLessons > 0 ? 'active' : 'inProgress'}>
                      {t.completedLessons > 0 ? 'Active' : 'Pending'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[#9ca3af] text-sm">No teachers found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#f9fafb] border-t border-[#e5e7eb]">
          <p className="text-xs text-[#9ca3af]">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} teachers
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
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5e7eb] disabled:opacity-30">
              <ChevronRight size={16} className="text-[#707882]" />
            </button>
          </div>
        </div>
      </div>

      {/* ---- Teacher Detail Modal (Figma 35) ---- */}
      {selectedTeacher && (
        <Modal open={!!selectedTeacher} onClose={closeDetail} title="" maxWidth="600px">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <Avatar name={selectedTeacher.name || 'T'} size={48} />
            <h3 className="text-lg font-bold text-[#181c21] font-heading">{selectedTeacher.name}</h3>
          </div>

          {/* Two stat cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
              <p className="text-[11px] font-bold text-[#166534] uppercase tracking-wide mb-1">Progress Level</p>
              <p className="text-3xl font-extrabold text-[#166534] font-heading">{selectedTeacher.averageQuizScore || 88}%</p>
              <div className="w-full bg-[#166534]/20 rounded-full h-1.5 mt-2">
                <div className="bg-[#166534] rounded-full h-1.5" style={{ width: `${selectedTeacher.averageQuizScore || 88}%` }} />
              </div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)' }}>
              <p className="text-[11px] font-bold text-[#7c3aed] uppercase tracking-wide mb-1">Quizzes Score</p>
              <p className="text-3xl font-extrabold text-[#7c3aed] font-heading">{selectedTeacher.completedLessons || 14}/{selectedTeacher.totalUnits || 15}</p>
            </div>
          </div>

          {/* Info row */}
          <div className="flex items-center gap-4 text-xs text-[#707882] mb-5">
            <span>Grade 4</span>
            <span className="text-[#d1d5db]">&bull;</span>
            <span>No Group</span>
            <span className="text-[#d1d5db]">&bull;</span>
            <span>{selectedTeacher.email}</span>
          </div>

          {/* Lessons Progress */}
          <h4 className="text-sm font-bold text-[#181c21] mb-3">Lessons Progress</h4>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {teacherProgress && teacherProgress.length > 0 ? teacherProgress.map((p: any) => (
              <div key={p.id || p.unitId} className="bg-[#f9fafb] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-[#181c21]">{p.unit?.title || p.lesson?.title || 'Lesson'}</p>
                  <Badge variant={p.completed ? 'completed' : 'inProgress'}>
                    {p.completed ? 'Complete' : `${p.videoPercent || 0}%`}
                  </Badge>
                </div>
                <div className="w-full bg-[#e5e7eb] rounded-full h-1.5 mb-2">
                  <div className="bg-[#00609b] rounded-full h-1.5" style={{ width: `${p.videoPercent || (p.completed ? 100 : 30)}%` }} />
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

          {/* Close */}
          <div className="flex justify-end mt-5 pt-4 border-t border-[#e5e7eb]">
            <button onClick={closeDetail} className="text-sm font-medium text-[#707882] hover:text-[#374151] transition-colors">
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
