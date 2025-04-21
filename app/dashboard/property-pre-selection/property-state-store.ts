// A simple store to manage property states
import { create } from "zustand"

// Define the store state
interface PropertyState {
  // Maps for tracking property states by ID
  selectedMap: Map<string, boolean>
  analysisRequestedMap: Map<string, boolean>
  virtualTourRequestedMap: Map<string, boolean>

  // Actions
  toggleSelection: (id: string) => void
  setAnalysisRequested: (id: string, value: boolean) => void
  setVirtualTourRequested: (id: string, value: boolean) => void

  resetPropertyState: (id: string) => void
}

// Create the store
export const usePropertyStateStore = create<PropertyState>((set) => ({
  // Initial state
  selectedMap: new Map<string, boolean>(),
  analysisRequestedMap: new Map<string, boolean>(),
  virtualTourRequestedMap: new Map<string, boolean>(),

  // Actions
  toggleSelection: (id: string) =>
    set((state) => {
      const newMap = new Map(state.selectedMap)
      newMap.set(id, !newMap.get(id))
      return { selectedMap: newMap }
    }),

  setAnalysisRequested: (id: string, value: boolean) =>
    set((state) => {
      const newMap = new Map(state.analysisRequestedMap)
      newMap.set(id, value)
      return { analysisRequestedMap: newMap }
    }),

  setVirtualTourRequested: (id: string, value: boolean) =>
    set((state) => {
      const newMap = new Map(state.virtualTourRequestedMap)
      newMap.set(id, value)
      return { virtualTourRequestedMap: newMap }
    }),

  resetPropertyState: (id: string) =>
    set((state) => {
      const newSelectedMap = new Map(state.selectedMap)
      const newAnalysisMap = new Map(state.analysisRequestedMap)
      const newVirtualTourMap = new Map(state.virtualTourRequestedMap)

      newSelectedMap.delete(id)
      newAnalysisMap.delete(id)
      newVirtualTourMap.delete(id)

      return {
        selectedMap: newSelectedMap,
        analysisRequestedMap: newAnalysisMap,
        virtualTourRequestedMap: newVirtualTourMap,
      }
    }),
}))
