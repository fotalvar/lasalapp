export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Técnico' | 'Usuario';
  avatar: {
    icon: string;
    color: string;
  };
  // Campos ya no necesarios para la nueva implementación de equipo
  // currentTasks: string[];
  // upcomingDeadlines: string[];
};

export type Responsibility = {
  id: string;
  title: string;
  assignee: TeamMember;
  deadline: Date;
  completed: boolean;
  subtasks: { id: string; text: string; completed: boolean }[];
};

export type Show = {
  id: string;
  title: string;
  company: string;
  status: 'Idea' | 'En conversaciones' | 'Confirmado' | 'Archivado';
  interactions: { date: Date; note: string }[];
};

export type Expense = {
  id: string;
  date: Date;
  description: string;
  category: 'Estructural' | 'Materiales' | 'Producción' | 'Marketing' | 'Otros';
  amount: number;
  amortization: number;
};

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
};
