function PriorityBadge({ priority }) {
  const variants = {
    HIGH: {
      label: "Alta",
      className: "bg-red-50 text-red-700 ring-red-600/10",
    },
    MEDIUM: {
      label: "Media",
      className: "bg-amber-50 text-amber-700 ring-amber-600/10",
    },
    LOW: {
      label: "Baja",
      className: "bg-slate-100 text-slate-600 ring-slate-500/10",
    },
  };

  const variant = variants[priority] ?? variants.MEDIUM;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${variant.className}`}
    >
      {variant.label}
    </span>
  );
}

export default PriorityBadge;