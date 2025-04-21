"use client"

import { useState, useEffect } from "react"

interface StepsCompleted {
  step1: boolean
  step2: boolean
  step3: boolean
  step4: boolean
  step5: boolean
  step6: boolean
  step7: boolean
}

export function useStepCompletion() {
  const [stepsCompleted, setStepsCompleted] = useState<StepsCompleted>({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
    step6: false,
    step7: false,
  })

  useEffect(() => {
    // Load saved step completion status from localStorage
    const savedSteps = localStorage.getItem("stepsCompleted")
    if (savedSteps) {
      try {
        setStepsCompleted(JSON.parse(savedSteps))
      } catch (error) {
        console.error("Error parsing saved steps:", error)
        // If there's an error, reset the steps
        localStorage.setItem("stepsCompleted", JSON.stringify(stepsCompleted))
      }
    } else {
      // Initialize with all steps incomplete for new users
      localStorage.setItem("stepsCompleted", JSON.stringify(stepsCompleted))
    }
  }, [])

  const markStepComplete = (step: keyof StepsCompleted) => {
    const updatedSteps = { ...stepsCompleted, [step]: true }
    setStepsCompleted(updatedSteps)
    localStorage.setItem("stepsCompleted", JSON.stringify(updatedSteps))
  }

  const markStepViewed = (step: keyof StepsCompleted) => {
    // This function only marks a step as viewed, but doesn't complete it
    // We could use this to track which steps the user has visited
    // For now, we're not using this functionality
  }

  const isStepComplete = (step: keyof StepsCompleted) => {
    return stepsCompleted[step]
  }

  const resetAllSteps = () => {
    const resetSteps = {
      step1: false,
      step2: false,
      step3: false,
      step4: false,
      step5: false,
      step6: false,
      step7: false,
    }
    setStepsCompleted(resetSteps)
    localStorage.setItem("stepsCompleted", JSON.stringify(resetSteps))
  }

  return {
    stepsCompleted,
    markStepComplete,
    markStepViewed,
    isStepComplete,
    resetAllSteps,
  }
}
