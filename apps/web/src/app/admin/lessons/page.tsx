'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { PageHeader, Badge, SearchBar, ConfirmBanner } from '@/components/ui';
import { Plus, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Admin Lessons Library — Figma screens-v2 / admin-add-lesson        */
/* ------------------------------------------------------------------ */

/** Stubbed avatar stack used for the "Assigned to" column. */
const MOCK_AVATARS = [
  { name: 'Sarah Miller', src: '/assets/avatars/sarah-miller.png' },
  { name: 'David Chen', src: '/assets/avatars/david-chen.png' },
  { name: 'Elena Rodriguez', src: '/assets/avatars/elena-rodriguez.png' },
  { name: 'James Whittaker', src: '/assets/avatars/james-whittaker.png' },
  { name: 'Rachel Schwartz', src: '/assets/avatars/rachel-schwartz.png' },
];

export default function AdminLessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const PER_PAGE = 6;

  const reload = () => api.lessons.list().then(setLessons).catch(console.error);
  useEffect(() => { reload(); }, []);

  /* ---------- filtering ---------- */
  const filtered = useMemo(() => {
    let list = lessons;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l => l.title?.toLowerCase().includes(q) || l.topic?.toLowerCase().includes(q));
    }
    return list;
  }, [lessons, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* ---------- delete ---------- */
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.lessons.delete(id);
      setConfirmingId(null);
      reload();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8">
      {/* ---- Page Header + Add Button ---- */}
      <div className="flex items-start justify-between mb-2">
        <PageHeader label="LESSONS" title="Lessons Library" />
        <button
          onClick={() => router.push('/admin/lessons/new')}
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
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
          }}
        >
          <option value="recent">Sorted by: Recently Added</option>
          <option value="name">Sorted by: Name</option>
        </select>
      </div>

      {/* ---- Lessons Table ---- */}
      <div className="bg-white rounded-[20px] border border-[#e5e7eb] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider w-20">ID</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Lesson name</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Topic</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Assigned to</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((lesson, idx) => {
              const lessonNum = String((page - 1) * PER_PAGE + idx + 1).padStart(3, '0');
              const isPublished = lesson.status === 'PUBLISHED' || !lesson.status;
              const isMandatory = lesson.isMandatory ?? true;
              const isOptional = lesson.isOptional ?? false;

              // Inline delete confirm: the whole row becomes the confirm banner.
              if (confirmingId === lesson.id) {
                return (
                  <tr key={lesson.id} className="border-b border-[#f3f4f6]">
                    <td colSpan={7} className="px-5 py-3">
                      <ConfirmBanner
                        message={`Delete ${lesson.title}? This cannot be undone.`}
                        onCancel={() => setConfirmingId(null)}
                        onConfirm={() => handleDelete(lesson.id)}
                        loading={deletingId === lesson.id}
                      />
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={lesson.id} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors">
                  {/* ID */}
                  <td className="px-5 py-3.5 text-sm text-[#707882]">#{lessonNum}</td>

                  {/* Name */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-[#181c21]">{lesson.title}</p>
                  </td>

                  {/* Topic */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-[#707882]">{lesson.topic || 'Classroom Management'}</p>
                  </td>

                  {/* Type — can show both Mandatory and Optional */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isMandatory && <Badge variant="mandatory">Mandatory</Badge>}
                      {isOptional && <Badge variant="optional">Optional</Badge>}
                      {!isMandatory && !isOptional && <span className="text-xs text-[#9ca3af]">—</span>}
                    </div>
                  </td>

                  {/* Assigned to — avatar stack */}
                  <td className="px-5 py-3.5">
                    <AvatarStack avatars={MOCK_AVATARS} visible={3} extra={2} />
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
                      <button
                        onClick={() => router.push(`/admin/lessons/${lesson.id}/edit`)}
                        className="w-8 h-8 rounded-lg hover:bg-[#f3f4f6] flex items-center justify-center transition-colors"
                        aria-label="Edit lesson"
                      >
                        <Edit2 size={14} className="text-[#707882]" />
                      </button>
                      <button
                        onClick={() => setConfirmingId(lesson.id)}
                        className="w-8 h-8 rounded-lg hover:bg-[#fee2e2] flex items-center justify-center transition-colors"
                        aria-label="Delete lesson"
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
                <td colSpan={7} className="text-center py-12 text-[#9ca3af] text-sm">
                  No lessons created yet
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#f9fafb] border-t border-[#e5e7eb]">
          <p className="text-xs text-[#9ca3af]">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}-
            {Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} lessons
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5e7eb] disabled:opacity-30"
            >
              <ChevronLeft size={16} className="text-[#707882]" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  page === p ? 'bg-[#00609b] text-white' : 'text-[#707882] hover:bg-[#e5e7eb]'
                }`}
              >
                {p}
              </button>
            ))}
            {totalPages > 5 && <span className="text-[#9ca3af] text-xs px-1">...</span>}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5e7eb] disabled:opacity-30"
            >
              <ChevronRight size={16} className="text-[#707882]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AvatarStack — 3 overlapping circles + "+N" pill                    */
/* ------------------------------------------------------------------ */

function AvatarStack({
  avatars,
  visible = 3,
  extra = 0,
}: {
  avatars: { name: string; src: string }[];
  visible?: number;
  extra?: number;
}) {
  const shown = avatars.slice(0, visible);
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map(a => (
          <div
            key={a.name}
            className="w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-[#e5e7eb]"
            title={a.name}
          >
            <Image src={a.src} alt={a.name} width={28} height={28} className="object-cover w-full h-full" />
          </div>
        ))}
      </div>
      {extra > 0 && (
        <div className="ml-1 w-7 h-7 rounded-full bg-[#e0f2fe] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#00609b]">
          +{extra}
        </div>
      )}
    </div>
  );
}
