export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function validateProjectForm(data: {
  name?: string
  description?: string
  ownerId?: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.name?.trim()) {
    errors.name = "Project name is required"
  } else if (data.name.length < 3) {
    errors.name = "Project name must be at least 3 characters"
  } else if (data.name.length > 100) {
    errors.name = "Project name must not exceed 100 characters"
  }

  if (data.description && data.description.length > 500) {
    errors.description = "Description must not exceed 500 characters"
  }

  if (!data.ownerId) {
    errors.ownerId = "Project owner is required"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateSprintForm(data: {
  name?: string
  goal?: string
  startDate?: string
  endDate?: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.name?.trim()) {
    errors.name = "Sprint name is required"
  } else if (data.name.length < 3) {
    errors.name = "Sprint name must be at least 3 characters"
  }

  if (data.goal && data.goal.length > 500) {
    errors.goal = "Goal must not exceed 500 characters"
  }

  if (!data.startDate) {
    errors.startDate = "Start date is required"
  }

  if (!data.endDate) {
    errors.endDate = "End date is required"
  }

  if (data.startDate && data.endDate && data.startDate >= data.endDate) {
    errors.endDate = "End date must be after start date"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateTaskForm(data: {
  title?: string
  description?: string
  estimatedHours?: number
  storyPoints?: number
  assigneeId?: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.title?.trim()) {
    errors.title = "Task title is required"
  } else if (data.title.length < 3) {
    errors.title = "Task title must be at least 3 characters"
  } else if (data.title.length > 200) {
    errors.title = "Task title must not exceed 200 characters"
  }

  if (data.description && data.description.length > 1000) {
    errors.description = "Description must not exceed 1000 characters"
  }

  if (!data.estimatedHours || data.estimatedHours < 1) {
    errors.estimatedHours = "Estimated hours must be at least 1"
  } else if (data.estimatedHours > 160) {
    errors.estimatedHours = "Estimated hours must not exceed 160"
  }

  if (!data.storyPoints || data.storyPoints < 1) {
    errors.storyPoints = "Story points must be at least 1"
  } else if (data.storyPoints > 21) {
    errors.storyPoints = "Story points must not exceed 21"
  }

  if (!data.assigneeId) {
    errors.assigneeId = "Assignee is required"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateHoursLogged(hours: number, estimatedHours: number): ValidationResult {
  const errors: Record<string, string> = {}

  if (hours <= 0) {
    errors.hours = "Hours must be greater than 0"
  }

  if (hours > estimatedHours * 2) {
    errors.hours = "Hours logged exceeds double the estimated time"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
