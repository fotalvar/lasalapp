import type { TeamMember, Show, Expense, Todo } from "./types";

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Anna",
    email: "anna@atresquarts.com",
    role: "Administrador",
    avatar: {
      icon: "Briefcase",
      color: "#3b82f6",
    },
    currentTasks: ["Finalizar presupuesto Q3", 'Revisión de guion para "Eco"'],
    upcomingDeadlines: [
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ],
  },
  {
    id: "2",
    name: "Bernat",
    email: "bernat@atresquarts.com",
    role: "Técnico",
    avatar: {
      icon: "Wrench",
      color: "#10b981",
    },
    currentTasks: [
      "Montaje de luces escenario principal",
      "Mantenimiento sistema de sonido",
    ],
    upcomingDeadlines: [
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    ],
  },
  {
    id: "3",
    name: "Carles",
    email: "carles@atresquarts.com",
    role: "Usuario",
    avatar: {
      icon: "Users",
      color: "#f59e0b",
    },
    currentTasks: [
      'Negociar con "Teatre Lliure"',
      "Solicitud de subvención para 2025",
    ],
    upcomingDeadlines: [
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    ],
  },
  {
    id: "4",
    name: "Diana",
    email: "diana@atresquarts.com",
    role: "Usuario",
    avatar: {
      icon: "Megaphone",
      color: "#ec4899",
    },
    currentTasks: [
      'Campaña en redes sociales para "Laberint"',
      "Nota de prensa nueva temporada",
    ],
    upcomingDeadlines: [
      new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    ],
  },
];

// NOTA: Los siguientes datos son ejemplos obsoletos que no se usan en la aplicación
// Se mantienen comentados por si se necesitan como referencia

/*
export const shows: Show[] = [
    {
        id: 'show1',
        title: 'Eco',
        companyId: 'company1',
        status: 'Confirmado',
        timeline: []
    },
    {
        id: 'show2',
        title: 'Laberint',
        companyId: 'company2',
        status: 'En conversaciones',
        timeline: []
    },
    {
        id: 'show3',
        title: 'Acròbates del Somni',
        companyId: 'company3',
        status: 'Idea',
        timeline: []
    }
];
*/

export const expenses: Expense[] = [];
