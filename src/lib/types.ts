export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "Administrador" | "Técnico" | "Usuario";
  avatar: {
    icon: string;
    color: string;
  };
  currentTasks?: string[];
  upcomingDeadlines?: string[];
};

export type TimelineEvent = {
  id: string;
  name: string;
  date: Date | null;
  isCustom: boolean;
  notes?: string;
};

export type Company = {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  instagram?: string;
  website?: string;
  type: string;
};

export type Show = {
  id: string;
  title: string;
  companyId: string;
  status:
    | "Idea"
    | "En conversaciones"
    | "Confirmado"
    | "Archivado"
    | "Proposta Pendent";
  timeline: TimelineEvent[];
  description?: string;
  duration?: string;
  price?: string;
  castSize?: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type:
    | "Publicaciones en redes"
    | "Venta de entradas"
    | "Espectáculos"
    | "Reunión de Equipo"
    | "Reunión Externa"
    | "Ensayos"
    | "Tarea de laSala";
  assigneeIds?: string[];
  completed?: boolean;
  archived?: boolean;
  status?: "Pendiente" | "En Progreso" | "Completada";
};

export type Expense = {
  id: string;
  date: Date;
  description: string;
  type: "Gasto" | "Ingreso";
  category:
    | "Mobiliario"
    | "Reformas"
    | "Materiales"
    | "Comida"
    | "Suministros"
    | "Producciones"
    | "Documentación"
    | "Fungible"
    | "Pago de bolos"
    | "Subvenciones"
    | "Aportación de miembro"
    | "Otros ingresos";
  amount: number;
  amortization: number;
  paidBy: string; // Nombre del miembro del equipo o "Tarjeta de la empresa"
};

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
};
