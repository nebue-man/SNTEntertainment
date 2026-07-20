'use client'

import { createContext, useContext, useState, type Dispatch, type SetStateAction } from 'react'

interface LogoContextValue {
  scrollProgress: number
  setScrollProgress: Dispatch<SetStateAction<number>>
}

const LogoContext = createContext<LogoContextValue>({
  scrollProgress: 0,
  setScrollProgress: () => {},
})

export function LogoProvider({ children }: { children: React.ReactNode }) {
  const [scrollProgress, setScrollProgress] = useState(0)
  return (
    <LogoContext.Provider value={{ scrollProgress, setScrollProgress }}>
      {children}
    </LogoContext.Provider>
  )
}

// Consumers that only need a boolean settled flag
export function useLogoSettled() {
  const { scrollProgress } = useContext(LogoContext)
  return { settled: scrollProgress >= 1 }
}

// HeroIntro uses this to write progress on every scroll event
export function useLogoScrollProgress() {
  return useContext(LogoContext)
}
