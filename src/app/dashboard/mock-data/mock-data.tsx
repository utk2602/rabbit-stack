// Dashboard Mock Data - All data types and constants

export interface SidebarItem {
  icon: string;
  label: string;
  active: boolean;
  href: string;
}

export interface IntegrationItem {
  icon: string;
  label: string;
  href: string;
}

export interface TeamItem {
  name: string;
  color: string;
  href: string;
}

export interface OverallStat {
  tasksCompleted: number;
  projectsStopped: number;
  progressPercent: number;
  projectsCount: number;
  inProgressCount: number;
  completeCount: number;
}

export interface ChartDataPoint {
  day: string;
  work: number;
  meditation: number;
}

export interface MonthProgressData {
  percentage: number;
  stats: {
    label: string;
    value: number;
    color: string;
  }[];
}

export interface GoalItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface TaskCard {
  id: string;
  title: string;
  avatar: string;
  time: string;
  avatarBg: string;
}

export interface ProjectCard {
  id: string;
  title: string;
  status: 'in-progress' | 'completed';
  progress?: number;
}

// ============ DATA EXPORTS ============

export const sidebarItems: SidebarItem[] = [
  { icon: '📊', label: 'Dashboard', active: true, href: '/dashboard' },
  { icon: '📅', label: 'Calendar', active: false, href: '/calendar' },
  { icon: '✓', label: 'My task', active: false, href: '/tasks' },
  { icon: '📈', label: "Static's", active: false, href: '/statistics' },
  { icon: '📄', label: 'Document', active: false, href: '/documents' },
];

export const integrations: IntegrationItem[] = [
  { icon: '💬', label: 'Slack', href: '/integrations/slack' },
  { icon: '🎮', label: 'Discord', href: '/integrations/discord' },
  { icon: '➕', label: 'Add Plugin', href: '/integrations/add' },
];

export const teams: TeamItem[] = [
  { name: 'Seo', color: '#FF6B6B', href: '/teams/seo' },
  { name: 'Marketing', color: '#4ECDC4', href: '/teams/marketing' },
];

export const overallStats: OverallStat = {
  tasksCompleted: 43,
  projectsStopped: 2,
  progressPercent: 78,
  projectsCount: 12,
  inProgressCount: 8,
  completeCount: 4,
};

export const weeklyProcessData: ChartDataPoint[] = [
  { day: 'Mon', work: 6, meditation: 3 },
  { day: 'Tue', work: 7, meditation: 4 },
  { day: 'Wed', work: 5, meditation: 5 },
  { day: 'Thu', work: 8, meditation: 3 },
  { day: 'Fri', work: 7, meditation: 6 },
  { day: 'Sat', work: 4, meditation: 7 },
  { day: 'Sun', work: 3, meditation: 8 },
];

export const monthProgress: MonthProgressData = {
  percentage: 30,
  stats: [
    { label: 'Work', value: 45, color: '#000000' },
    { label: 'Meditation', value: 25, color: '#666666' },
    { label: 'Exercise', value: 30, color: '#CCCCCC' },
  ],
};

export const monthGoals: GoalItem[] = [
  { id: '1', label: 'Meditation', checked: true },
  { id: '2', label: 'Running', checked: true },
  { id: '3', label: 'Workout', checked: false },
  { id: '4', label: 'Pooja', checked: false },
];

export const tasksInProcess: TaskCard[] = [
  {
    id: '1',
    title: 'Meet HR',
    avatar: 'HR',
    time: '2:00 PM',
    avatarBg: '#000000',
  },
  {
    id: '2',
    title: 'Boss Appointment',
    avatar: 'BA',
    time: '4:30 PM',
    avatarBg: '#666666',
  },
];

export const lastProjects: ProjectCard[] = [
  {
    id: '1',
    title: 'New Schedule',
    status: 'in-progress',
    progress: 65,
  },
  {
    id: '2',
    title: 'Anime UI design',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Creative UI design',
    status: 'completed',
  },
];
