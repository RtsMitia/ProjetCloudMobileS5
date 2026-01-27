function StatusFilter({ filterStatus, onFilterChange, compact = true }) {
  if (compact) {
    return (
      <select
        value={filterStatus}
        onChange={(e) => onFilterChange(e.target.value)}
        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">Tous les statuts</option>
        <option value="pending">En attente</option>
        <option value="inprogress">En cours</option>
        <option value="resolved">Résolus</option>
      </select>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => onFilterChange("all")}
        className={`flex-1 text-sm py-1.5 rounded ${filterStatus === "all" ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
      >
        Tous
      </button>
      <button
        onClick={() => onFilterChange("pending")}
        className={`flex-1 text-sm py-1.5 rounded ${filterStatus === "pending" ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'}`}
      >
        Ouverts
      </button>
      <button
        onClick={() => onFilterChange("inprogress")}
        className={`flex-1 text-sm py-1.5 rounded ${filterStatus === "inprogress" ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
      >
        Assignés
      </button>
      <button
        onClick={() => onFilterChange("resolved")}
        className={`flex-1 text-sm py-1.5 rounded ${filterStatus === "resolved" ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
      >
        Résolus
      </button>
    </div>
  );
}

export default StatusFilter;