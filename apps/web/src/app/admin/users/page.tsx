'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { PageHeader, Avatar, Badge, SearchBar, Modal } from '@/components/ui';
import { Plus, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Admin Users — matches Figma 30                                     */
/* ------------------------------------------------------------------ */

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [page, setPage] = useState(1);
  const [showAddUser, setShowAddUser] = useState(false);
  const PER_PAGE = 4;

  const reload = () => api.users.list().then(setUsers).catch(console.error);
  useEffect(() => { reload(); }, []);

  /* ---------- filtering ---------- */
  const filtered = useMemo(() => {
    let list = users;
    if (roleFilter) list = list.filter(u => u.role === roleFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    return list;
  }, [users, roleFilter, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /* ---------- counts ---------- */
  const totalStaff = users.length;
  const activeCount = users.filter(u => u.status !== 'INACTIVE').length;
  const inactiveCount = totalStaff - activeCount;

  /* ---------- delete ---------- */
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    await api.users.delete(id);
    reload();
  };

  const roleTabs = [
    { key: '', label: 'All Roles' },
    { key: 'TEACHER', label: 'Teachers' },
    { key: 'DIRECTOR', label: 'Directors' },
  ];

  const roleVariantMap: Record<string, 'teacher' | 'director' | 'admin'> = {
    TEACHER: 'teacher',
    DIRECTOR: 'director',
    ADMIN: 'admin',
  };

  return (
    <div className="p-8">
      {/* ---- Page Header ---- */}
      <PageHeader label="USERS" title="User Management" />

      {/* ---- Stat Cards + Add User Button ---- */}
      <div className="flex items-start gap-5 mb-8">
        {/* Total Staff card */}
        <div className="flex-1 rounded-[32px] p-6 text-white" style={{ background: 'linear-gradient(135deg, #00609b 0%, #004a79 100%)' }}>
          <p className="text-xs font-bold tracking-widest uppercase opacity-80 mb-1">TOTAL STAFF</p>
          <div className="flex items-end justify-between">
            <p className="text-[42px] font-extrabold font-heading leading-none">{totalStaff}</p>
            {/* Mini pie chart placeholder */}
            <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/20" />
            </div>
          </div>
        </div>

        {/* Active Status card */}
        <div className="flex-1 rounded-[32px] p-6 text-white" style={{ background: 'linear-gradient(135deg, #00609b 0%, #004a79 100%)' }}>
          <p className="text-xs font-bold tracking-widest uppercase opacity-80 mb-1">ACTIVE STATUS</p>
          <p className="text-[42px] font-extrabold font-heading leading-none mb-2">{activeCount}</p>
          <div className="flex items-center gap-3">
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              {users.slice(0, 4).map(u => (
                <Avatar key={u.id} name={u.name || 'U'} size={28} className="ring-2 ring-[#00609b]" />
              ))}
            </div>
            <div className="text-xs opacity-80">
              <span className="font-bold">{activeCount}</span> active, <span className="font-bold">{inactiveCount}</span> inactive
            </div>
          </div>
        </div>

        {/* Add New User button */}
        <button
          onClick={() => setShowAddUser(true)}
          className="flex items-center gap-2 bg-[#00609b] text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#004a79] transition-colors whitespace-nowrap mt-4"
        >
          <Plus size={16} />
          Add New User
        </button>
      </div>

      {/* ---- Filters ---- */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Search staff or campus..." className="w-64" />

        {/* Role tabs */}
        <div className="flex gap-1">
          {roleTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setRoleFilter(tab.key); setPage(1); }}
              className={`text-xs font-medium px-4 py-2 rounded-full transition-colors ${roleFilter === tab.key ? 'bg-[#00609b] text-white' : 'bg-white text-[#707882] border border-[#e5e7eb] hover:bg-[#f3f4f6]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="h-9 px-3 pr-8 rounded-full border border-[#e5e7eb] bg-white text-xs font-medium text-[#374151] cursor-pointer outline-none appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          <option value="recent">Sort by: Recently Added</option>
          <option value="name">Sort by: Name</option>
          <option value="role">Sort by: Role</option>
        </select>
      </div>

      {/* ---- Users Table ---- */}
      <div className="bg-white rounded-[20px] border border-[#e5e7eb] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">School / Campus</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(u => (
              <tr key={u.id} className="border-b border-[#f3f4f6] hover:bg-[#f9fafb] transition-colors">
                {/* Name + Avatar */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name || 'U'} size={36} />
                    <div>
                      <p className="text-sm font-semibold text-[#181c21]">{u.name}</p>
                      <p className="text-xs text-[#9ca3af]">{u.email}</p>
                    </div>
                  </div>
                </td>

                {/* School */}
                <td className="px-5 py-3.5">
                  <p className="text-sm text-[#707882]">{u.school || u.campus || 'Main Campus'}</p>
                </td>

                {/* Role badge */}
                <td className="px-5 py-3.5">
                  <Badge variant={roleVariantMap[u.role] || 'teacher'}>
                    {u.role}
                  </Badge>
                </td>

                {/* Status */}
                <td className="px-5 py-3.5">
                  <Badge variant="active">Active</Badge>
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="w-8 h-8 rounded-lg hover:bg-[#f3f4f6] flex items-center justify-center transition-colors">
                      <Edit2 size={14} className="text-[#707882]" />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="w-8 h-8 rounded-lg hover:bg-[#fee2e2] flex items-center justify-center transition-colors"
                    >
                      <Trash2 size={14} className="text-[#ef4444]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[#9ca3af] text-sm">No users found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#f9fafb] border-t border-[#e5e7eb]">
          <p className="text-xs text-[#9ca3af]">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
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

      {/* ---- Add User Modal ---- */}
      <AddUserModal
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        onCreated={() => { setShowAddUser(false); reload(); }}
      />
    </div>
  );
}

/* ================================================================== */
/*  Add User Modal                                                     */
/* ================================================================== */

function AddUserModal({
  open, onClose, onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'TEACHER' });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await api.auth.register({ ...form });
      onCreated();
      setForm({ name: '', email: '', password: '', role: 'TEACHER' });
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Add New User" maxWidth="440px">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#374151] mb-1.5 block">Full Name</label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="John Smith"
            className="w-full h-10 px-3 rounded-xl border border-[#e5e7eb] text-sm text-[#374151] focus:border-[#00609b] outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#374151] mb-1.5 block">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="john@school.edu"
            className="w-full h-10 px-3 rounded-xl border border-[#e5e7eb] text-sm text-[#374151] focus:border-[#00609b] outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#374151] mb-1.5 block">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Minimum 8 characters"
            className="w-full h-10 px-3 rounded-xl border border-[#e5e7eb] text-sm text-[#374151] focus:border-[#00609b] outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#374151] mb-1.5 block">Role</label>
          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-[#e5e7eb] text-sm text-[#374151] focus:border-[#00609b] outline-none"
          >
            <option value="TEACHER">Teacher</option>
            <option value="DIRECTOR">Director</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="text-sm font-medium text-[#707882] hover:text-[#374151]">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={!form.name || !form.email || !form.password || creating}
            className="bg-[#00609b] hover:bg-[#004a79] text-white text-sm font-bold px-6 py-2.5 rounded-full disabled:opacity-40 transition-colors"
          >
            {creating ? 'Creating...' : 'Add User'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
