'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { FormField, TextInput } from '@/components/ui';

/* ------------------------------------------------------------------ */
/*  Admin Users — Edit User                                            */
/*  Matches Figma screens-v2/admin-edit-user-desktop.png               */
/* ------------------------------------------------------------------ */

type RoleOption = 'TEACHER' | 'DIRECTOR' | 'ADMIN';

const ROLE_OPTIONS: { value: RoleOption; label: string }[] = [
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'DIRECTOR', label: 'Director' },
  { value: 'ADMIN', label: 'Admin' },
];

export default function AdminEditUserPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [form, setForm] = useState({
    name: '',
    email: '',
    school: '',
    role: 'TEACHER' as RoleOption,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- load user ---------- */
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.users
      .get(id)
      .then((u: any) => {
        setForm({
          name: u.name || '',
          email: u.email || '',
          school: u.school || '',
          role: (u.role as RoleOption) || 'TEACHER',
        });
      })
      .catch((err) => {
        console.error(err);
        setError(err?.message || 'Failed to load user');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const canSubmit = !!form.name.trim() && !!form.email.trim() && !!form.role;

  const handleSubmit = async () => {
    if (!canSubmit || !id) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.users.update(id, {
        name: form.name.trim(),
        email: form.email.trim(),
        school: form.school.trim() || undefined,
        role: form.role,
      });
      router.push('/admin/users');
    } catch (err: any) {
      setError(err?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      {/* ---- Breadcrumb ---- */}
      <p className="text-[11px] font-bold tracking-widest uppercase text-[#00609b] mb-2">
        USERS &nbsp;&gt;&nbsp; EDIT USER
      </p>

      {/* ---- Title ---- */}
      <h1 className="text-[48px] font-extrabold font-heading text-[#181c21] leading-none mb-8">
        Edit User
      </h1>

      {/* ---- Form Card ---- */}
      <div className="bg-white rounded-[24px] border border-[#e5e7eb] p-8 max-w-[820px]">
        {loading ? (
          <p className="text-sm text-[#9ca3af] py-8 text-center">Loading...</p>
        ) : (
          <div className="space-y-5">
            <FormField label="Full name" required>
              <TextInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter full name"
              />
            </FormField>

            <FormField label="Email" required>
              <TextInput
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </FormField>

            <FormField label="School">
              <TextInput
                value={form.school}
                onChange={(e) => setForm({ ...form, school: e.target.value })}
                placeholder="School name"
              />
            </FormField>

            {/* ---- Role pill selector ---- */}
            <FormField label="Role" required>
              <div className="flex items-center gap-3">
                {ROLE_OPTIONS.map((opt) => {
                  const selected = form.role === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, role: opt.value })}
                      className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                        selected
                          ? 'bg-[#00609b] text-white'
                          : 'bg-white text-[#707882] border border-[#e5e7eb] hover:bg-[#f3f4f6]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </FormField>

            {error && (
              <p className="text-sm font-medium text-[#dc2626]">{error}</p>
            )}

            {/* ---- Footer ---- */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-[#707882] border border-[#e5e7eb] bg-white hover:bg-[#f3f4f6] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="px-8 py-2.5 rounded-full text-sm font-bold text-white bg-[#00609b] hover:bg-[#004a79] disabled:opacity-40 transition-colors"
              >
                {submitting ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
