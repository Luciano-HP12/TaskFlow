function StatusBadge({ status }) {
  const variants = {
    PENDING: {
      label: "Pendiente",
      className: "bg-amber-50 text-amber-700 ring-amber-600/10",
    },

    IN_PROGRESS: {
      label: "En progreso",
      className: "bg-blue-50 text-blue-700 ring-blue-600/10",
    },

    COMPLETED: {
      label: "Completada",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    },
  };

  const variant = variants[status] ?? variants.PENDING;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${variant.className}`}
    >
      {variant.label}
    </span>
  );
}

export default StatusBadge;