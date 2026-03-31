'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { PageHeader, Avatar, SearchBar, Modal } from '@/components/ui';
import { Plus, Trash2, UserPlus, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Director Groups — manages teacher groups                           */
/* ------------------------------------------------------------------ */

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [addMemberGroupId, setAddMemberGroupId] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  const reload = () => api.groups.list().then(setGroups).catch(console.error);

  useEffect(() => {
    reload();
    api.users.list('TEACHER').then(setTeachers).catch(console.error);
  }, []);

  /* ---------- filtering ---------- */
  const filtered = useMemo(() => {
    if (!search) return groups;
    const q = search.toLowerCase();
    return groups.filter(g => g.name?.toLowerCase().includes(q));
  }, [groups, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* ---------- actions ---------- */
  const handleCreate = async () => {
    await api.groups.create(newGroup);
    setShowCreate(false);
    setNewGroup({ name: '', description: '' });
    reload();
  };

  const handleAddMember = async (groupId: string) => {
    if (!selectedTeacher) return;
    await api.groups.addMember(groupId, selectedTeacher);
    setAddMemberGroupId(null);
    setSelectedTeacher('');
    reload();
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    await api.groups.removeMember(groupId, userId);
    reload();
  };

  return (
    <div className="p-8">
      {/* ---- Page Header ---- */}
      <div className="flex items-center justify-between mb-2">
        <PageHeader label="GROUPS" title="Group Management" />
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#00609b] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#004a79] transition-colors"
        >
          <Plus size={16} />
          Add New Group
        </button>
      </div>

      {/* ---- Filters ---- */}
      <div className="flex items-center gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search groups..." className="w-72" />
        <select className="h-9 px-3 pr-8 rounded-full border border-[#e5e7eb] bg-white text-xs font-medium text-[#374151] cursor-pointer outline-none appearance-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
          <option>Sort by: Recently Added</option>
          <option>Sort by: Name</option>
          <option>Sort by: Members</option>
        </select>
      </div>

      {/* ---- Groups Table ---- */}
      <div className="bg-white rounded-[20px] border border-[#e5e7eb] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider w-20">ID</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Group Name</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Assigned Teachers</th>
              <th className="text-right px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((g, idx) => {
              const memberCount = g._count?.members || g.members?.length || 0;
              const members = g.members || [];
              const groupNum = String((page - 1) * PER_PAGE + idx + 1).padStart(3, '0');

              return (
                <tr key={g.id} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors">
                  {/* ID */}
                  <td className="px-5 py-3.5 text-sm text-[#707882]">#{groupNum}</td>

                  {/* Name */}
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-[#181c21]">{g.name}</p>
                  </td>

                  {/* Avatar stack + count */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {members.slice(0, 3).map((m: any) => (
                          <Avatar key={m.user?.id || m.id} name={m.user?.name || 'U'} size={28} className="ring-2 ring-white" />
                        ))}
                      </div>
                      <span className="text-xs text-[#707882]">{memberCount} Teachers</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setAddMemberGroupId(addMemberGroupId === g.id ? null : g.id); }}
                        className="text-[#00609b] hover:text-[#004a79] ml-1"
                      >
                        <UserPlus size={14} />
                      </button>
                    </div>

                    {/* Add member inline */}
                    {addMemberGroupId === g.id && (
                      <div className="flex gap-2 mt-2 p-2 bg-[#f9fafb] rounded-lg">
                        <select
                          value={selectedTeacher}
                          onChange={e => setSelectedTeacher(e.target.value)}
                          className="flex-1 h-8 px-2 rounded-lg border border-[#e5e7eb] text-xs"
                        >
                          <option value="">Select teacher</option>
                          {teachers.filter(t => !members.some((m: any) => (m.userId || m.user?.id) === t.id)).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAddMember(g.id)}
                          className="bg-[#00609b] text-white text-xs px-3 rounded-lg hover:bg-[#004a79]"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    {/* Member list with remove */}
                    {addMemberGroupId === g.id && members.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {members.map((m: any) => (
                          <div key={m.user?.id || m.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-[#f3f4f6]">
                            <div className="flex items-center gap-2">
                              <Avatar name={m.user?.name || 'U'} size={20} />
                              <span className="text-xs text-[#374151]">{m.user?.name}</span>
                            </div>
                            <button onClick={() => handleRemoveMember(g.id, m.user?.id || m.userId)} className="text-[#ef4444] hover:text-[#dc2626]">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-8 h-8 rounded-lg hover:bg-[#f3f4f6] flex items-center justify-center transition-colors">
                        <Edit2 size={14} className="text-[#707882]" />
                      </button>
                      <button className="w-8 h-8 rounded-lg hover:bg-[#fee2e2] flex items-center justify-center transition-colors">
                        <Trash2 size={14} className="text-[#ef4444]" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-[#9ca3af] text-sm">No groups created yet</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#f9fafb] border-t border-[#e5e7eb]">
          <p className="text-xs text-[#9ca3af]">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} groups
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

      {/* ---- Create Group Modal ---- */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Group" maxWidth="440px">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#374151] mb-1.5 block">Group Name</label>
            <input
              value={newGroup.name}
              onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
              placeholder="e.g. Science Faculty B"
              className="w-full h-10 px-3 rounded-xl border border-[#e5e7eb] text-sm text-[#374151] focus:border-[#00609b] outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#374151] mb-1.5 block">Description (optional)</label>
            <input
              value={newGroup.description}
              onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
              placeholder="Brief description"
              className="w-full h-10 px-3 rounded-xl border border-[#e5e7eb] text-sm text-[#374151] focus:border-[#00609b] outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="text-sm font-medium text-[#707882] hover:text-[#374151]">Cancel</button>
            <button
              onClick={handleCreate}
              disabled={!newGroup.name}
              className="bg-[#00609b] hover:bg-[#004a79] text-white text-sm font-bold px-6 py-2.5 rounded-full disabled:opacity-40 transition-colors"
            >
              Create Group
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
