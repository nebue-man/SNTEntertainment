'use client'

import { createContext, useContext, useState, type Dispatch, type SetStateAction } from 'react'

// Stable context — only holds the useState setter, which React guarantees is the
// same function reference for the lifetime of the component. This value never
// changes, so subscribers never re-render due to scroll events.
const LogoScrollSetterContext = createContext<Dispatch<SetStateAction<number>>>(() => {})

// Value context — holds the raw number. Changes on every scroll event; only
// subscribe here if your component actually needs to react to the value.
const LogoScrollValueContext = createContext<number>(0)

export function LogoProvider({ children }: { children: React.ReactNode }) {
  const [scrollProgress, setScrollProgress] = useState(0)
  return (
    <LogoScrollSetterContext.Provider value={setScrollProgress}>
      <LogoScrollValueContext.Provider value={scrollProgress}>
        {children}
      </LogoScrollValueContext.Provider>
    </LogoScrollSetterContext.Provider>
  )
}

// HeroIntro uses this to write progress on every scroll event.
// Subscribes only to the setter context → zero scroll-driven re-renders.
export function useSetLogoScrollProgress(): Dispatch<SetStateAction<number>> {
  return useContext(LogoScrollSetterContext)
}

// For consumers that need both read and write access.
export function useLogoScrollProgress() {
  const scrollProgress = useContext(LogoScrollValueContext)
  const setScrollProgress = useContext(LogoScrollSetterContext)
  return { scrollProgress, setScrollProgress }
}

// BottomNav: re-renders only when settled flips (scrollProgress crosses 1).
export function useLogoSettled() {
  const scrollProgress = useContext(LogoScrollValueContext)
  return { settled: scrollProgress >= 1 }
}
