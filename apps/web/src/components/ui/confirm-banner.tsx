'use client';

interface ConfirmBannerProps {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Inline red confirmation banner rendered *inside* a table row (replacing it).
 * Matches Figma delete confirm pattern: "Delete X? This cannot be undone."
 * used in 343:13469 (delete lesson) and 343:13185 (delete user).
 */
export default function ConfirmBanner({
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmBannerProps) {
  return (
    <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3 flex items-center justify-between gap-4">
      <p className="text-sm font-medium text-[#991b1b]">{message}</p>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="text-sm font-semibold text-[#6b7280] hover:text-[#374151] px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="text-sm font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c] px-4 py-1.5 rounded-full transition-colors disabled:opacity-50"
        >
          {loading ? '...' : confirmLabel}
        </button>
      </div>
    </div>
  );
}
