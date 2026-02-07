const DEFAULT_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "inprogress", label: "En cours" },
  { value: "resolved", label: "Résolus" },
];

function StatusFilter({ filterStatus, onFilterChange, compact = true, options = DEFAULT_OPTIONS }) {
  if (compact) {
    return (
      <select
        value={filterStatus}
        onChange={(e) => onFilterChange(e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  }

  const buttonColors = {
    all: "bg-blue-600",
    pending: "bg-amber-600",
    inprogress: "bg-blue-600",
    resolved: "bg-emerald-600",
  };

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onFilterChange(opt.value)}
          className={`flex-1 text-sm py-1.5 rounded ${filterStatus === opt.value ? `${buttonColors[opt.value] || "bg-blue-600"} text-white` : 'bg-gray-100 text-gray-600'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default StatusFilter;