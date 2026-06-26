import { useState, useCallback } from "react"
import { type Task } from "@/lib/mock-data"

export interface DeleteConfirmation {
  open: boolean
  type: "project" | "sprint" | "task" | null
  id: string
  name: string
}

export interface ModalState {
  createProject: boolean
  createSprint: boolean
  createTask: boolean
  logHours: boolean
  blockTask: boolean
  dailyUpdate: boolean
  deleteConfirmation: DeleteConfirmation
}

export function useModals() {
  const [modals, setModals] = useState<ModalState>({
    createProject: false,
    createSprint: false,
    createTask: false,
    logHours: false,
    blockTask: false,
    dailyUpdate: false,
    deleteConfirmation: {
      open: false,
      type: null,
      id: "",
      name: "",
    },
  })

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedSprintId, setSelectedSprintId] = useState<string>("")
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")

  const openModal = useCallback((modalName: keyof Omit<ModalState, "deleteConfirmation">) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: true,
    }))
  }, [])

  const closeModal = useCallback((modalName: keyof Omit<ModalState, "deleteConfirmation">) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: false,
    }))
  }, [])

  const openDeleteConfirmation = useCallback(
    (type: "project" | "sprint" | "task", id: string, name: string) => {
      setModals((prev) => ({
        ...prev,
        deleteConfirmation: {
          open: true,
          type,
          id,
          name,
        },
      }))
    },
    []
  )

  const closeDeleteConfirmation = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      deleteConfirmation: {
        open: false,
        type: null,
        id: "",
        name: "",
      },
    }))
  }, [])

  return {
    modals,
    selectedTask,
    setSelectedTask,
    selectedSprintId,
    setSelectedSprintId,
    selectedProjectId,
    setSelectedProjectId,
    openModal,
    closeModal,
    openDeleteConfirmation,
    closeDeleteConfirmation,
  }
}
