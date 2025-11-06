export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Técnico' | 'Usuario';
  avatar: {
    icon: string;
    color: string;
  };
};

export type Task = {
  id: string;
  title: string;
  assignee: TeamMember;
  deadline: Date;
  completed: boolean;
  subtasks: { id: string; text: string; completed: boolean }[];
};

export type TimelineEvent = {
  id: string;
  name: string;
  date: Date | null;
  isCustom: boolean;
  notes?: string;
};

export type Show = {
  id: string;
  title: string;
  company: string;
  status: 'Idea' | 'En conversaciones' | 'Confirmado' | 'Archivado';
  timeline: TimelineEvent[];
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
