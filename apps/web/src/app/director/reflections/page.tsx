'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { PageHeader, Avatar, SearchBar } from '@/components/ui';
import { MessageSquare } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Director Reflections — matches Figma 33                            */
/* ------------------------------------------------------------------ */

export default function ReflectionsPage() {
  const [reflections, setReflections] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'reflections' | 'exit-tickets'>('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7');

  useEffect(() => {
    api.analytics.reflections().then(setReflections).catch(console.error);
  }, []);

  /* ---------- unique units for filter ---------- */
  const units = useMemo(() => {
    const set = new Set<string>();
    reflections.forEach(r => {
      const unitTitle = r.unit?.title || r.unit?.lesson?.title;
      if (unitTitle) set.add(unitTitle);
    });
    return Array.from(set);
  }, [reflections]);

  /* ---------- filtering ---------- */
  const filtered = useMemo(() => {
    let list = reflections;

    // search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.user?.name?.toLowerCase().includes(q) ||
        r.content?.toLowerCase().includes(q)
      );
    }

    // tab filter
    if (tab === 'reflections') {
      list = list.filter(r => r.type === 'REFLECTION' || !r.type);
    } else if (tab === 'exit-tickets') {
      list = list.filter(r => r.type === 'EXIT_TICKET');
    }

    // unit filter
    if (unitFilter !== 'all') {
      list = list.filter(r => (r.unit?.title || r.unit?.lesson?.title) === unitFilter);
    }

    // date filter
    if (dateFilter !== 'all') {
      const days = parseInt(dateFilter);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      list = list.filter(r => new Date(r.createdAt) >= cutoff);
    }

    return list;
  }, [reflections, search, tab, unitFilter, dateFilter]);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'reflections', label: 'Reflections' },
    { key: 'exit-tickets', label: 'Exit Tickets' },
  ] as const;

  return (
    <div className="p-8">
      {/* ---- Page Header ---- */}
      <PageHeader label="REFLECTIONS & EXIT TICKETS" title="Reflections Overview" />

      {/* ---- Filters ---- */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search reflections or teachers..."
          className="w-72"
        />

        {/* Tab pills */}
        <div className="flex rounded-full bg-[#f3f4f6] p-0.5">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-colors ${
                tab === t.key
                  ? 'bg-white text-[#181c21] shadow-sm'
                  : 'text-[#9ca3af] hover:text-[#707882]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Unit dropdown */}
        <select
          value={unitFilter}
          onChange={e => setUnitFilter(e.target.value)}
          className="h-9 px-3 pr-8 rounded-full border border-[#e5e7eb] bg-white text-xs font-medium text-[#374151] cursor-pointer focus:border-[#00609b] focus:ring-1 focus:ring-[#00609b]/20 outline-none appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          <option value="all">All Units</option>
          {units.map(u => <option key={u} value={u}>{u}</option>)}
        </select>

        {/* Date dropdown */}
        <select
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="h-9 px-3 pr-8 rounded-full border border-[#e5e7eb] bg-white text-xs font-medium text-[#374151] cursor-pointer focus:border-[#00609b] focus:ring-1 focus:ring-[#00609b]/20 outline-none appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* ---- Reflection Cards ---- */}
      <div className="space-y-4">
        {filtered.map(r => {
          const unitLabel = r.unit?.lesson?.title
            ? `${r.unit.lesson.title}`
            : r.unit?.title || 'Interactive Learning Techniques';

          return (
            <div key={r.id} className="bg-white rounded-[20px] border border-[#e5e7eb] p-5">
              {/* Author row */}
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={r.user?.name || 'User'} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#181c21]">{r.user?.name}</p>
                  <p className="text-xs text-[#9ca3af]">{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Unit tag */}
              <div className="inline-flex items-center gap-1.5 bg-[#dcfce7] text-[#166534] text-[11px] font-bold px-3 py-1 rounded-full mb-3">
                <span>&#128215;</span>
                Unit: {unitLabel}
              </div>

              {/* Content */}
              <div className="bg-[#f9fafb] rounded-xl p-4">
                <p className="text-sm text-[#374151] leading-relaxed">{r.content}</p>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-[20px] border border-[#e5e7eb] p-10 text-center">
            <MessageSquare size={36} className="text-[#d1d5db] mx-auto mb-3" />
            <p className="text-sm text-[#9ca3af]">No reflections found</p>
            <p className="text-xs text-[#d1d5db] mt-1">Reflections will appear here once teachers share them</p>
          </div>
        )}
      </div>
    </div>
  );
}
