import { type Capacity, type Task, type User } from "@/lib/mock-data"

export function calculateCapacityStatus(capacity: Capacity): "underallocated" | "balanced" | "overloaded" {
  const utilization = capacity.utilizationPercentage
  if (utilization < 70) return "underallocated"
  if (utilization <= 100) return "balanced"
  return "overloaded"
}

export function calculateUtilizationPercentage(
  allocatedHours: number,
  totalAvailableHours: number
): number {
  if (totalAvailableHours === 0) return 0
  return Math.round((allocatedHours / totalAvailableHours) * 100)
}

export function getTeamCapacitySummary(capacities: Capacity[]) {
  const totalAvailable = capacities.reduce((sum, c) => sum + c.totalAvailableHours, 0)
  const totalAllocated = capacities.reduce((sum, c) => sum + c.allocatedHours, 0)
  const totalRemaining = capacities.reduce((sum, c) => sum + c.remainingHours, 0)

  return {
    totalAvailable,
    totalAllocated,
    totalRemaining,
    avgUtilization: calculateUtilizationPercentage(totalAllocated, totalAvailable),
    overloadedCount: capacities.filter((c) => c.status === "overloaded").length,
  }
}

export function getTeamMemberCapacity(
  userId: string,
  sprintId: string,
  capacities: Capacity[]
): Capacity | undefined {
  return capacities.find((c) => c.userId === userId && c.sprintId === sprintId)
}

export function calculateRemainingCapacity(
  totalAvailableHours: number,
  allocatedHours: number
): number {
  return Math.max(0, totalAvailableHours - allocatedHours)
}

export function getCapacityColor(status: "underallocated" | "balanced" | "overloaded"): string {
  switch (status) {
    case "underallocated":
      return "text-blue-600"
    case "balanced":
      return "text-green-600"
    case "overloaded":
      return "text-red-600"
  }
}

export function getCapacityBgColor(status: "underallocated" | "balanced" | "overloaded"): string {
  switch (status) {
    case "underallocated":
      return "bg-blue-100"
    case "balanced":
      return "bg-green-100"
    case "overloaded":
      return "bg-red-100"
  }
}

export function estimateTaskHours(storyPoints: number, pointsPerHour: number = 1): number {
  return storyPoints * pointsPerHour
}

export function getCapacityHealthScore(capacities: Capacity[]): number {
  if (capacities.length === 0) return 100

  const avgUtilization = capacities.reduce((sum, c) => sum + c.utilizationPercentage, 0) / capacities.length
  
  // Health score: 100 at 80-100% utilization, decreases as it goes above/below
  if (avgUtilization >= 80 && avgUtilization <= 100) return 100
  if (avgUtilization < 80) return Math.round(80 + (avgUtilization - 0) / 0.8)
  return Math.round(100 - (avgUtilization - 100) * 10)
}
