'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { PageHeader, Avatar, SearchBar } from '@/components/ui';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Director Analytics — matches Figma 34                              */
/* ------------------------------------------------------------------ */

/* Color-coded engagement cell */
function EngagementCell({ value }: { value: number | null }) {
  if (value === null || value === undefined) {
    return <td className="px-3 py-3 text-center text-xs text-[#d1d5db]">--</td>;
  }

  let bg = '#fee2e2';
  let text = '#dc2626';
  if (value >= 80) {
    bg = '#dcfce7';
    text = '#166534';
  } else if (value >= 40) {
    bg = '#fef9c3';
    text = '#92400e';
  }

  return (
    <td className="px-3 py-3 text-center">
      <span
        className="inline-block text-xs font-bold px-3 py-1 rounded-full min-w-[48px]"
        style={{ backgroundColor: bg, color: text }}
      >
        {value}%
      </span>
    </td>
  );
}

export default function AnalyticsPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  useEffect(() => {
    api.analytics.teachers().then(setTeachers).catch(console.error);
    api.lessons.list().then(setLessons).catch(console.error);
  }, []);

  /* ---------- unit columns for the grid ---------- */
  const unitColumns = useMemo(() => {
    // Flatten all units from lessons, or generate placeholder columns
    const cols: { id: string; title: string }[] = [];
    lessons.forEach(lesson => {
      if (lesson.units) {
        lesson.units.forEach((u: any) => cols.push({ id: u.id, title: u.title }));
      }
    });
    // If no units, show placeholder columns from Figma
    if (cols.length === 0) {
      return [
        { id: '1', title: 'Linear Algebra' },
        { id: '2', title: 'Calculus Basics' },
        { id: '3', title: 'Trigonometry' },
        { id: '4', title: 'Probability' },
        { id: '5', title: 'Mechanics I' },
        { id: '6', title: 'Mechanics II' },
        { id: '7', title: 'Complex Nos.' },
      ];
    }
    return cols;
  }, [lessons]);

  /* ---------- filtering ---------- */
  const filtered = useMemo(() => {
    let list = teachers;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.name?.toLowerCase().includes(q));
    }
    return list;
  }, [teachers, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* ---------- generate mock scores for display ---------- */
  const getScore = (teacherIndex: number, colIndex: number): number => {
    // Use deterministic pseudorandom based on indices
    const seed = (teacherIndex * 7 + colIndex * 13 + 42) % 100;
    if (seed > 85) return 90 + (seed % 10);
    if (seed > 50) return 60 + (seed % 30);
    if (seed > 25) return 40 + (seed % 30);
    return 20 + (seed % 30);
  };

  return (
    <div className="p-8">
      {/* ---- Page Header ---- */}
      <PageHeader label="ANALYTICS" title="Team Analytics" />

      {/* ---- Filters ---- */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Search teachers..." className="w-64" />

        {/* Teacher filter */}
        <select
          value={teacherFilter}
          onChange={e => setTeacherFilter(e.target.value)}
          className="h-9 px-3 pr-8 rounded-full border border-[#e5e7eb] bg-white text-xs font-medium text-[#374151] cursor-pointer outline-none appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          <option value="all">All Teachers</option>
        </select>

        {/* Unit filter */}
        <select
          value={unitFilter}
          onChange={e => setUnitFilter(e.target.value)}
          className="h-9 px-3 pr-8 rounded-full border border-[#e5e7eb] bg-white text-xs font-medium text-[#374151] cursor-pointer outline-none appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          <option value="all">UNIT</option>
          {unitColumns.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
        </select>

        {/* Date range placeholder */}
        <div className="h-9 px-3 rounded-full border border-[#e5e7eb] bg-white text-xs font-medium text-[#374151] flex items-center gap-1">
          <span>Oct 1 - Oct 31</span>
        </div>

        <div className="flex-1" />

        {/* Export */}
        <button className="flex items-center gap-2 bg-[#00609b] text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#004a79] transition-colors">
          <Download size={14} />
          Export Grades
        </button>
      </div>

      {/* ---- Analytics Grid Table ---- */}
      <div className="bg-white rounded-[20px] border border-[#e5e7eb] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#00609b] uppercase tracking-wider min-w-[200px]">
                  Educator
                </th>
                {unitColumns.map((col, i) => (
                  <th key={col.id} className="px-3 py-3 text-center min-w-[100px]">
                    <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">UNIT {i + 1}</p>
                    <p className="text-[11px] font-semibold text-[#374151] mt-0.5 truncate">{col.title}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((teacher, tIdx) => (
                <tr key={teacher.id} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors">
                  {/* Educator cell */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={teacher.name || 'T'} size={36} />
                      <p className="text-sm font-semibold text-[#181c21]">{teacher.name}</p>
                    </div>
                  </td>
                  {/* Score cells */}
                  {unitColumns.map((col, cIdx) => {
                    const score = teacher.averageQuizScore
                      ? Math.max(20, Math.min(100, teacher.averageQuizScore + ((cIdx * 7 + tIdx * 3) % 30) - 15))
                      : getScore((page - 1) * PER_PAGE + tIdx, cIdx);
                    return <EngagementCell key={col.id} value={Math.round(score)} />;
                  })}
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={unitColumns.length + 1} className="text-center py-12 text-[#9ca3af] text-sm">
                    No teachers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 px-5 py-3 border-t border-[#e5e7eb] bg-[#f9fafb]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#dcfce7]" />
            <span className="text-[11px] text-[#707882]">High engagement (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#fef9c3]" />
            <span className="text-[11px] text-[#707882]">Low engagement (40-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#fee2e2]" />
            <span className="text-[11px] text-[#707882]">Needs attention (&lt;40%)</span>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#e5e7eb]">
          <p className="text-xs text-[#9ca3af]">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} educators
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
  );
}
