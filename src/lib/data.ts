import type { TeamMember, Responsibility, Show, Expense, Todo } from './types';

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Anna',
    email: 'anna@atresquarts.com',
    role: 'Director',
    avatar: 'user-avatar-1',
    currentTasks: ['Finalize Q3 budget', 'Script review for "Eco"'],
    upcomingDeadlines: [new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()],
  },
  {
    id: '2',
    name: 'Bernat',
    email: 'bernat@atresquarts.com',
    role: 'Technician',
    avatar: 'user-avatar-2',
    currentTasks: ['Lighting setup for main stage', 'Sound system maintenance'],
    upcomingDeadlines: [new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()],
  },
  {
    id: '3',
    name: 'Carles',
    email: 'carles@atresquarts.com',
    role: 'Producer',
    avatar: 'user-avatar-3',
    currentTasks: ['Negotiate with "Teatre Lliure"', 'Grant application for 2025'],
    upcomingDeadlines: [new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()],
  },
  {
    id: '4',
    name: 'Diana',
    email: 'diana@atresquarts.com',
    role: 'Marketing',
    avatar: 'user-avatar-4',
    currentTasks: ['Social media campaign for "Laberint"', 'Press release for new season'],
    upcomingDeadlines: [new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()],
  },
];

export const responsibilities: Responsibility[] = [
  {
    id: 'resp1',
    title: 'Organize the end-of-year company dinner',
    assignee: teamMembers[3],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    completed: false,
    subtasks: [
      { id: 'st1-1', text: 'Find a venue', completed: true },
      { id: 'st1-2', text: 'Send out invitations', completed: false },
      { id: 'st1-3', text: 'Plan the menu', completed: false },
    ],
  },
  {
    id: 'resp2',
    title: 'Update the website with the new season shows',
    assignee: teamMembers[1],
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    completed: false,
    subtasks: [
      { id: 'st2-1', text: 'Get posters from design', completed: true },
      { id: 'st2-2', text: 'Write show descriptions', completed: true },
      { id: 'st2-3', text: 'Upload content to CMS', completed: false },
      { id: 'st2-4', text: 'Test on all devices', completed: false },
    ],
  },
  {
    id: 'resp3',
    title: 'Prepare the annual financial report',
    assignee: teamMembers[0],
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    completed: true,
    subtasks: [
        { id: 'st3-1', text: 'Consolidate all expenses', completed: true },
        { id: 'st3-2', text: 'Verify income statements', completed: true },
        { id: 'st3-3', text: 'Generate final report', completed: true },
    ],
  },
];

export const shows: Show[] = [
    {
        id: 'show1',
        title: 'Eco',
        company: 'La Fura dels Baus',
        status: 'Confirmed',
        interactions: [
            { date: new Date('2023-10-15'), note: 'Initial contact made.'},
            { date: new Date('2023-11-01'), note: 'Contract sent.'},
        ]
    },
    {
        id: 'show2',
        title: 'Laberint',
        company: 'Dagoll Dagom',
        status: 'In talks',
        interactions: [
            { date: new Date('2024-01-20'), note: 'Reached out to producer.'},
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
    { id: 'exp1', date: new Date('2024-07-15'), description: 'Main stage lighting rig', category: 'Structural', amount: 15000, amortization: 5 },
    { id: 'exp2', date: new Date('2024-07-20'), description: 'Wood for set construction', category: 'Materials', amount: 800, amortization: 1 },
    { id: 'exp3', date: new Date('2024-07-22'), description: 'Actors\' fees for "Eco"', category: 'Production', amount: 25000, amortization: 1 },
    { id: 'exp4', date: new Date('2024-07-25'), description: 'Facebook Ads for "Eco"', category: 'Marketing', amount: 500, amortization: 1 },
];

export const todos: Todo[] = [
    { id: 'todo1', text: 'Renew fire safety certificate', completed: false, dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) },
    { id: 'todo2', text: 'Clean the storage room', completed: false },
    { id: 'todo3', text: 'Call the internet provider about the slow connection', completed: true },
    { id: 'todo4', text: 'Buy more coffee for the office', completed: false },
];
