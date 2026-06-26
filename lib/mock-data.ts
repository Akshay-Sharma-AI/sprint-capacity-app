export type UserRole = "admin" | "manager" | "member"
export type AvailabilityStatus = "available" | "partial" | "on-leave" | "overloaded"
export type ProjectStatus = "active" | "planning" | "on-hold" | "completed"
export type SprintStatus = "planning" | "active" | "completed"
export type TaskType = "story" | "task" | "bug" | "epic"
export type TaskPriority = "low" | "medium" | "high" | "critical"
export type TaskStatus = "todo" | "in-progress" | "in-review" | "qa" | "done" | "blocked"
export type Mood = "good" | "neutral" | "stuck" | "overloaded"
export type CapacityStatus = "underallocated" | "balanced" | "overloaded"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  initials: string
  role: UserRole
  team: string
  dailyCapacityHours: number
  availabilityStatus: AvailabilityStatus
}

export interface Project {
  id: string
  name: string
  owner: string
  ownerId: string
  status: ProjectStatus
  startDate: string
  endDate: string
  currentSprint: string
  teamSize: number
  completionPercentage: number
  description: string
}

export interface Sprint {
  id: string
  projectId: string
  name: string
  goal: string
  startDate: string
  endDate: string
  status: SprintStatus
  committedStoryPoints: number
  completedStoryPoints: number
}

export interface Task {
  id: string
  projectId: string
  sprintId: string | null
  title: string
  description: string
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  assigneeId: string
  storyPoints: number
  estimatedHours: number
  loggedHours: number
  remainingHours: number
  dueDate: string
  isBlocked: boolean
  blockerReason: string
  comments: number
  labels: string[]
}

export interface Capacity {
  userId: string
  sprintId: string
  availableDays: number
  dailyCapacityHours: number
  leaveHours: number
  totalAvailableHours: number
  allocatedHours: number
  remainingHours: number
  utilizationPercentage: number
  status: CapacityStatus
}

export interface DailyUpdate {
  id: string
  userId: string
  taskId: string
  date: string
  workedOn: string
  nextPlan: string
  blockers: string
  hoursLogged: number
  mood: Mood
}

export const users: User[] = [
  {
    id: "u1",
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    avatar: "",
    initials: "SC",
    role: "manager",
    team: "Frontend",
    dailyCapacityHours: 8,
    availabilityStatus: "available",
  },
  {
    id: "u2",
    name: "Marcus Johnson",
    email: "marcus.j@company.com",
    avatar: "",
    initials: "MJ",
    role: "member",
    team: "Frontend",
    dailyCapacityHours: 8,
    availabilityStatus: "available",
  },
  {
    id: "u3",
    name: "Priya Patel",
    email: "priya.p@company.com",
    avatar: "",
    initials: "PP",
    role: "member",
    team: "Backend",
    dailyCapacityHours: 8,
    availabilityStatus: "overloaded",
  },
  {
    id: "u4",
    name: "Tom Nakamura",
    email: "tom.n@company.com",
    avatar: "",
    initials: "TN",
    role: "member",
    team: "Backend",
    dailyCapacityHours: 6,
    availabilityStatus: "partial",
  },
  {
    id: "u5",
    name: "Elena Rodriguez",
    email: "elena.r@company.com",
    avatar: "",
    initials: "ER",
    role: "member",
    team: "Design",
    dailyCapacityHours: 8,
    availabilityStatus: "available",
  },
  {
    id: "u6",
    name: "David Kim",
    email: "david.k@company.com",
    avatar: "",
    initials: "DK",
    role: "member",
    team: "QA",
    dailyCapacityHours: 8,
    availabilityStatus: "on-leave",
  },
  {
    id: "u7",
    name: "Alicia Thompson",
    email: "alicia.t@company.com",
    avatar: "",
    initials: "AT",
    role: "admin",
    team: "Engineering",
    dailyCapacityHours: 8,
    availabilityStatus: "available",
  },
  {
    id: "u8",
    name: "Ben Walker",
    email: "ben.w@company.com",
    avatar: "",
    initials: "BW",
    role: "member",
    team: "Frontend",
    dailyCapacityHours: 8,
    availabilityStatus: "available",
  },
]

export const projects: Project[] = [
  {
    id: "p1",
    name: "Platform Redesign",
    owner: "Sarah Chen",
    ownerId: "u1",
    status: "active",
    startDate: "2025-05-01",
    endDate: "2025-08-31",
    currentSprint: "Sprint 4",
    teamSize: 6,
    completionPercentage: 42,
    description: "Complete redesign of the core platform UI with new design system.",
  },
  {
    id: "p2",
    name: "API Gateway v2",
    owner: "Tom Nakamura",
    ownerId: "u4",
    status: "active",
    startDate: "2025-04-15",
    endDate: "2025-07-31",
    currentSprint: "Sprint 6",
    teamSize: 4,
    completionPercentage: 68,
    description: "Build the next-generation API gateway with improved performance.",
  },
  {
    id: "p3",
    name: "Mobile App Beta",
    owner: "Marcus Johnson",
    ownerId: "u2",
    status: "planning",
    startDate: "2025-07-01",
    endDate: "2025-12-31",
    currentSprint: "Sprint 1",
    teamSize: 5,
    completionPercentage: 12,
    description: "Launch of the mobile companion app for iOS and Android.",
  },
  {
    id: "p4",
    name: "Data Pipeline Migration",
    owner: "Priya Patel",
    ownerId: "u3",
    status: "active",
    startDate: "2025-03-01",
    endDate: "2025-06-30",
    currentSprint: "Sprint 9",
    teamSize: 3,
    completionPercentage: 85,
    description: "Migrate legacy data pipelines to new cloud infrastructure.",
  },
  {
    id: "p5",
    name: "Auth Service Upgrade",
    owner: "Alicia Thompson",
    ownerId: "u7",
    status: "on-hold",
    startDate: "2025-06-01",
    endDate: "2025-09-30",
    currentSprint: "Sprint 2",
    teamSize: 3,
    completionPercentage: 28,
    description: "Upgrade authentication service with MFA and SSO support.",
  },
]

export const sprints: Sprint[] = [
  {
    id: "s1",
    projectId: "p1",
    name: "Sprint 4",
    goal: "Complete core dashboard components and implement new navigation patterns",
    startDate: "2026-06-16",
    endDate: "2026-07-04",
    status: "active",
    committedStoryPoints: 48,
    completedStoryPoints: 31,
  },
  {
    id: "s2",
    projectId: "p2",
    name: "Sprint 6",
    goal: "Implement rate limiting and authentication middleware",
    startDate: "2026-06-16",
    endDate: "2026-07-04",
    status: "active",
    committedStoryPoints: 36,
    completedStoryPoints: 28,
  },
  {
    id: "s3",
    projectId: "p3",
    name: "Sprint 1",
    goal: "Set up project infrastructure and design system",
    startDate: "2026-06-23",
    endDate: "2026-07-10",
    status: "active",
    committedStoryPoints: 24,
    completedStoryPoints: 8,
  },
]

export const tasks: Task[] = [
  {
    id: "t1",
    projectId: "p1",
    sprintId: "s1",
    title: "Redesign dashboard header component",
    description: "Update the main dashboard header to match new design system",
    type: "story",
    priority: "high",
    status: "done",
    assigneeId: "u2",
    storyPoints: 5,
    estimatedHours: 8,
    loggedHours: 7,
    remainingHours: 0,
    dueDate: "2026-06-27",
    isBlocked: false,
    blockerReason: "",
    comments: 4,
    labels: ["frontend", "ui"],
  },
  {
    id: "t2",
    projectId: "p1",
    sprintId: "s1",
    title: "Implement sprint burndown chart",
    description: "Build interactive burndown chart using Recharts",
    type: "story",
    priority: "high",
    status: "in-progress",
    assigneeId: "u2",
    storyPoints: 8,
    estimatedHours: 13,
    loggedHours: 6,
    remainingHours: 7,
    dueDate: "2026-07-01",
    isBlocked: false,
    blockerReason: "",
    comments: 2,
    labels: ["frontend", "charts"],
  },
  {
    id: "t3",
    projectId: "p1",
    sprintId: "s1",
    title: "Fix navigation sidebar scroll bug",
    description: "Sidebar loses scroll position on route change",
    type: "bug",
    priority: "critical",
    status: "in-review",
    assigneeId: "u5",
    storyPoints: 3,
    estimatedHours: 4,
    loggedHours: 3,
    remainingHours: 1,
    dueDate: "2026-06-28",
    isBlocked: false,
    blockerReason: "",
    comments: 6,
    labels: ["bug", "navigation"],
  },
  {
    id: "t4",
    projectId: "p1",
    sprintId: "s1",
    title: "Capacity planning page layout",
    description: "Create the capacity planning page with team table and charts",
    type: "story",
    priority: "high",
    status: "in-progress",
    assigneeId: "u1",
    storyPoints: 8,
    estimatedHours: 12,
    loggedHours: 4,
    remainingHours: 8,
    dueDate: "2026-07-04",
    isBlocked: true,
    blockerReason: "Waiting for design mockups from Elena",
    comments: 3,
    labels: ["frontend", "planning"],
  },
  {
    id: "t5",
    projectId: "p1",
    sprintId: "s1",
    title: "User avatar upload feature",
    description: "Allow users to upload and crop profile pictures",
    type: "task",
    priority: "medium",
    status: "todo",
    assigneeId: "u8",
    storyPoints: 3,
    estimatedHours: 6,
    loggedHours: 0,
    remainingHours: 6,
    dueDate: "2026-07-04",
    isBlocked: false,
    blockerReason: "",
    comments: 1,
    labels: ["feature"],
  },
  {
    id: "t6",
    projectId: "p1",
    sprintId: "s1",
    title: "Design system token documentation",
    description: "Document all design tokens in Storybook",
    type: "task",
    priority: "low",
    status: "blocked",
    assigneeId: "u5",
    storyPoints: 2,
    estimatedHours: 4,
    loggedHours: 1,
    remainingHours: 3,
    dueDate: "2026-07-04",
    isBlocked: true,
    blockerReason: "Storybook version conflict with React 19",
    comments: 5,
    labels: ["docs", "design-system"],
  },
  {
    id: "t7",
    projectId: "p2",
    sprintId: "s2",
    title: "Implement JWT refresh token rotation",
    description: "Add automatic refresh token rotation for improved security",
    type: "story",
    priority: "critical",
    status: "in-review",
    assigneeId: "u3",
    storyPoints: 8,
    estimatedHours: 12,
    loggedHours: 10,
    remainingHours: 2,
    dueDate: "2026-06-30",
    isBlocked: false,
    blockerReason: "",
    comments: 8,
    labels: ["security", "backend"],
  },
  {
    id: "t8",
    projectId: "p2",
    sprintId: "s2",
    title: "Rate limiting middleware",
    description: "Implement sliding window rate limiting per API key",
    type: "story",
    priority: "high",
    status: "done",
    assigneeId: "u4",
    storyPoints: 5,
    estimatedHours: 8,
    loggedHours: 9,
    remainingHours: 0,
    dueDate: "2026-06-27",
    isBlocked: false,
    blockerReason: "",
    comments: 3,
    labels: ["backend", "middleware"],
  },
  {
    id: "t9",
    projectId: "p1",
    sprintId: null,
    title: "Integrate notification system",
    description: "Build real-time notification system with WebSockets",
    type: "story",
    priority: "medium",
    status: "todo",
    assigneeId: "u2",
    storyPoints: 13,
    estimatedHours: 20,
    loggedHours: 0,
    remainingHours: 20,
    dueDate: "2026-07-10",
    isBlocked: false,
    blockerReason: "",
    comments: 0,
    labels: ["backend", "realtime"],
  },
  {
    id: "t10",
    projectId: "p1",
    sprintId: null,
    title: "Dark mode theme support",
    description: "Add system-wide dark mode toggle",
    type: "epic",
    priority: "medium",
    status: "todo",
    assigneeId: "u5",
    storyPoints: 21,
    estimatedHours: 32,
    loggedHours: 0,
    remainingHours: 32,
    dueDate: "2026-07-25",
    isBlocked: false,
    blockerReason: "",
    comments: 2,
    labels: ["design-system", "theme"],
  },
  {
    id: "t11",
    projectId: "p1",
    sprintId: null,
    title: "Performance audit and optimization",
    description: "Audit bundle size and implement code splitting",
    type: "task",
    priority: "high",
    status: "todo",
    assigneeId: "u8",
    storyPoints: 8,
    estimatedHours: 12,
    loggedHours: 0,
    remainingHours: 12,
    dueDate: "2026-07-15",
    isBlocked: false,
    blockerReason: "",
    comments: 0,
    labels: ["performance"],
  },
  {
    id: "t12",
    projectId: "p2",
    sprintId: "s2",
    title: "API response caching layer",
    description: "Add Redis caching for frequently accessed endpoints",
    type: "story",
    priority: "medium",
    status: "qa",
    assigneeId: "u6",
    storyPoints: 5,
    estimatedHours: 8,
    loggedHours: 6,
    remainingHours: 2,
    dueDate: "2026-07-01",
    isBlocked: false,
    blockerReason: "",
    comments: 2,
    labels: ["backend", "cache"],
  },
]

export const capacities: Capacity[] = [
  {
    userId: "u1",
    sprintId: "s1",
    availableDays: 10,
    dailyCapacityHours: 8,
    leaveHours: 0,
    totalAvailableHours: 80,
    allocatedHours: 52,
    remainingHours: 28,
    utilizationPercentage: 65,
    status: "balanced",
  },
  {
    userId: "u2",
    sprintId: "s1",
    availableDays: 10,
    dailyCapacityHours: 8,
    leaveHours: 0,
    totalAvailableHours: 80,
    allocatedHours: 74,
    remainingHours: 6,
    utilizationPercentage: 93,
    status: "overloaded",
  },
  {
    userId: "u3",
    sprintId: "s1",
    availableDays: 10,
    dailyCapacityHours: 8,
    leaveHours: 0,
    totalAvailableHours: 80,
    allocatedHours: 88,
    remainingHours: -8,
    utilizationPercentage: 110,
    status: "overloaded",
  },
  {
    userId: "u4",
    sprintId: "s1",
    availableDays: 9,
    dailyCapacityHours: 6,
    leaveHours: 8,
    totalAvailableHours: 46,
    allocatedHours: 32,
    remainingHours: 14,
    utilizationPercentage: 70,
    status: "balanced",
  },
  {
    userId: "u5",
    sprintId: "s1",
    availableDays: 10,
    dailyCapacityHours: 8,
    leaveHours: 0,
    totalAvailableHours: 80,
    allocatedHours: 40,
    remainingHours: 40,
    utilizationPercentage: 50,
    status: "underallocated",
  },
  {
    userId: "u6",
    sprintId: "s1",
    availableDays: 5,
    dailyCapacityHours: 8,
    leaveHours: 40,
    totalAvailableHours: 0,
    allocatedHours: 0,
    remainingHours: 0,
    utilizationPercentage: 0,
    status: "underallocated",
  },
  {
    userId: "u8",
    sprintId: "s1",
    availableDays: 10,
    dailyCapacityHours: 8,
    leaveHours: 0,
    totalAvailableHours: 80,
    allocatedHours: 58,
    remainingHours: 22,
    utilizationPercentage: 73,
    status: "balanced",
  },
]

export const dailyUpdates: DailyUpdate[] = [
  {
    id: "du1",
    userId: "u2",
    taskId: "t2",
    date: "2026-06-25",
    workedOn: "Built the core burndown chart component with Recharts. Added hover tooltips and responsive sizing.",
    nextPlan: "Add data filtering and sprint selector dropdown to chart",
    blockers: "",
    hoursLogged: 6,
    mood: "good",
  },
  {
    id: "du2",
    userId: "u3",
    taskId: "t7",
    date: "2026-06-25",
    workedOn: "Finished JWT refresh token rotation logic. Added unit tests for edge cases.",
    nextPlan: "Complete code review and address feedback comments",
    blockers: "Need security team sign-off before merging",
    hoursLogged: 8,
    mood: "neutral",
  },
  {
    id: "du3",
    userId: "u1",
    taskId: "t4",
    date: "2026-06-25",
    workedOn: "Worked on capacity planning page layout and table component",
    nextPlan: "Integrate capacity chart once design mockups arrive",
    blockers: "Waiting for design mockups from Elena",
    hoursLogged: 4,
    mood: "stuck",
  },
  {
    id: "du4",
    userId: "u5",
    taskId: "t3",
    date: "2026-06-25",
    workedOn: "Fixed the navigation sidebar scroll bug. Found root cause in React router state management.",
    nextPlan: "Final testing and submit PR for review",
    blockers: "",
    hoursLogged: 5,
    mood: "good",
  },
  {
    id: "du5",
    userId: "u2",
    taskId: "t2",
    date: "2026-06-24",
    workedOn: "Set up Recharts dependencies and created basic chart scaffold",
    nextPlan: "Build core burndown chart component",
    blockers: "",
    hoursLogged: 5,
    mood: "good",
  },
  {
    id: "du6",
    userId: "u3",
    taskId: "t7",
    date: "2026-06-24",
    workedOn: "Implemented token rotation algorithm and database migration",
    nextPlan: "Write unit tests for edge cases",
    blockers: "",
    hoursLogged: 8,
    mood: "overloaded",
  },
]

// Burndown chart data for active sprint
export const burndownData = [
  { day: "Day 1", ideal: 48, actual: 48 },
  { day: "Day 2", ideal: 43, actual: 44 },
  { day: "Day 3", ideal: 38, actual: 39 },
  { day: "Day 4", ideal: 34, actual: 37 },
  { day: "Day 5", ideal: 29, actual: 33 },
  { day: "Day 6", ideal: 24, actual: 28 },
  { day: "Day 7", ideal: 19, actual: 24 },
  { day: "Day 8", ideal: 14, actual: 20 },
  { day: "Day 9", ideal: 10, actual: 17 },
  { day: "Day 10", ideal: 5, actual: null },
  { day: "Day 11", ideal: 0, actual: null },
]

// Capacity utilization data
export const capacityChartData = users
  .filter((u) => capacities.find((c) => c.userId === u.id))
  .map((u) => {
    const cap = capacities.find((c) => c.userId === u.id)!
    return {
      name: u.name.split(" ")[0],
      available: cap.totalAvailableHours,
      allocated: cap.allocatedHours,
      utilization: cap.utilizationPercentage,
    }
  })

// Task status distribution
export const taskStatusData = [
  { name: "Done", value: 2, fill: "var(--chart-1)" },
  { name: "In Progress", value: 3, fill: "var(--chart-2)" },
  { name: "In Review", value: 2, fill: "var(--chart-3)" },
  { name: "QA", value: 1, fill: "var(--chart-4)" },
  { name: "Blocked", value: 1, fill: "var(--chart-5)" },
]

// Sprint velocity data
export const velocityData = [
  { sprint: "Sprint 1", committed: 32, completed: 28 },
  { sprint: "Sprint 2", committed: 40, completed: 38 },
  { sprint: "Sprint 3", committed: 44, completed: 36 },
  { sprint: "Sprint 4", committed: 48, completed: 31 },
]

// Capacity over time
export const capacityTrendData = [
  { sprint: "Sprint 1", utilization: 72 },
  { sprint: "Sprint 2", utilization: 81 },
  { sprint: "Sprint 3", utilization: 78 },
  { sprint: "Sprint 4", utilization: 85 },
]
