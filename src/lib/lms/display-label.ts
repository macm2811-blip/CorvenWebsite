/** Display labels only. Persisted values and authorization rules remain unchanged. */
export function displayLabel(value: string) {
  const labels: Record<string, string> = {
    Pagado: "Paid", Pendiente: "Pending", Vencido: "Overdue", Alta: "High", Media: "Medium", Baja: "Low",
    Abierto: "Open", "En proceso": "In progress", Respondido: "Answered", Cerrado: "Closed",
    paid: "Paid", pending: "Pending", overdue: "Overdue", waived: "Waived", cancelled: "Cancelled",
    open: "Open", in_progress: "In progress", answered: "Answered", closed: "Closed",
    scheduled: "Scheduled", live: "Live", completed: "Completed", Estudiante: "Student",
  };
  return labels[value] ?? value;
}
