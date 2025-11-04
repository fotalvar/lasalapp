import type { TeamMember, Responsibility, Show, Expense, Todo } from './types';

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Anna',
    email: 'anna@atresquarts.com',
    role: 'Director',
    avatar: 'user-avatar-1',
    currentTasks: ['Finalizar presupuesto Q3', 'Revisión de guion para "Eco"'],
    upcomingDeadlines: [new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()],
  },
  {
    id: '2',
    name: 'Bernat',
    email: 'bernat@atresquarts.com',
    role: 'Técnico',
    avatar: 'user-avatar-2',
    currentTasks: ['Montaje de luces escenario principal', 'Mantenimiento sistema de sonido'],
    upcomingDeadlines: [new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()],
  },
  {
    id: '3',
    name: 'Carles',
    email: 'carles@atresquarts.com',
    role: 'Productor',
    avatar: 'user-avatar-3',
    currentTasks: ['Negociar con "Teatre Lliure"', 'Solicitud de subvención para 2025'],
    upcomingDeadlines: [new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()],
  },
  {
    id: '4',
    name: 'Diana',
    email: 'diana@atresquarts.com',
    role: 'Marketing',
    avatar: 'user-avatar-4',
    currentTasks: ['Campaña en redes sociales para "Laberint"', 'Nota de prensa nueva temporada'],
    upcomingDeadlines: [new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()],
  },
];

export const responsibilities: Responsibility[] = [
  {
    id: 'resp1',
    title: 'Organizar la cena de empresa de fin de año',
    assignee: teamMembers[3],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    completed: false,
    subtasks: [
      { id: 'st1-1', text: 'Encontrar un lugar', completed: true },
      { id: 'st1-2', text: 'Enviar invitaciones', completed: false },
      { id: 'st1-3', text: 'Planificar el menú', completed: false },
    ],
  },
  {
    id: 'resp2',
    title: 'Actualizar la web con los nuevos espectáculos de la temporada',
    assignee: teamMembers[1],
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    completed: false,
    subtasks: [
      { id: 'st2-1', text: 'Conseguir carteles de diseño', completed: true },
      { id: 'st2-2', text: 'Escribir descripciones de los espectáculos', completed: true },
      { id: 'st2-3', text: 'Subir contenido al CMS', completed: false },
      { id: 'st2-4', text: 'Probar en todos los dispositivos', completed: false },
    ],
  },
  {
    id: 'resp3',
    title: 'Preparar el informe financiero anual',
    assignee: teamMembers[0],
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    completed: true,
    subtasks: [
        { id: 'st3-1', text: 'Consolidar todos los gastos', completed: true },
        { id: 'st3-2', text: 'Verificar cuentas de ingresos', completed: true },
        { id: 'st3-3', text: 'Generar informe final', completed: true },
    ],
  },
];

export const shows: Show[] = [
    {
        id: 'show1',
        title: 'Eco',
        company: 'La Fura dels Baus',
        status: 'Confirmado',
        interactions: [
            { date: new Date('2023-10-15'), note: 'Contacto inicial realizado.'},
            { date: new Date('2023-11-01'), note: 'Contrato enviado.'},
        ]
    },
    {
        id: 'show2',
        title: 'Laberint',
        company: 'Dagoll Dagom',
        status: 'En conversaciones',
        interactions: [
            { date: new Date('2024-01-20'), note: 'Contacto con el productor.'},
        ]
    },
    {
        id: 'show3',
        title: 'Acròbates del Somni',
        company: 'Circ Raluy',
        status: 'Idea',
        interactions: []
    }
];

export const expenses: Expense[] = [
    { id: 'exp1', date: new Date('2024-07-15'), description: 'Estructura de luces escenario principal', category: 'Estructural', amount: 15000, amortization: 5 },
    { id: 'exp2', date: new Date('2024-07-20'), description: 'Madera para escenografía', category: 'Materiales', amount: 800, amortization: 1 },
    { id: 'exp3', date: new Date('2024-07-22'), description: 'Caché actores para "Eco"', category: 'Producción', amount: 25000, amortization: 1 },
    { id: 'exp4', date: new Date('2024-07-25'), description: 'Anuncios en Facebook para "Eco"', category: 'Marketing', amount: 500, amortization: 1 },
];

export const todos: Todo[] = [
    { id: 'todo1', text: 'Renovar certificado de seguridad anti-incendios', completed: false, dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) },
    { id: 'todo2', text: 'Limpiar el almacén', completed: false },
    { id: 'todo3', text: 'Llamar al proveedor de internet por la conexión lenta', completed: true },
    { id: 'todo4', text: 'Comprar más café para la oficina', completed: false },
];
