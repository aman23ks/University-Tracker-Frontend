"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"

interface Settings {
  emailNotifications: boolean
  exportFormat: "xlsx" | "csv" | "json"
  theme: "light" | "dark" | "system"
  timezone: string
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (settings: Partial<Settings>) => Promise<void>
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const defaultSettings: Settings = {
  emailNotifications: true,
  exportFormat: "xlsx",
  theme: "system",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>(
    "user-settings",
    defaultSettings
  )

  // Update theme when settings change
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    
    if (settings.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(settings.theme)
    }
  }, [settings.theme])

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)

    // Here you could also sync with backend
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings)
      })
      if (!response.ok) throw new Error("Failed to save settings")
    } catch (error) {
      console.error("Failed to sync settings:", error)
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}