export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'Director' | 'Technician' | 'Producer' | 'Marketing' | 'Admin';
  avatar: string;
  currentTasks: string[];
  upcomingDeadlines: string[];
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
  status: 'Idea' | 'In talks' | 'Confirmed' | 'Archived';
  interactions: { date: Date; note: string }[];
};

export type Expense = {
  id: string;
  date: Date;
  description: string;
  category: 'Structural' | 'Materials' | 'Production' | 'Marketing' | 'Other';
  amount: number;
  amortization: number;
};

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: Date;
};
