'use client'

import { createContext, useContext, useState, type Dispatch, type SetStateAction } from 'react'

interface LogoContextValue {
  settled:    boolean
  setSettled: Dispatch<SetStateAction<boolean>>
}

const LogoContext = createContext<LogoContextValue>({
  settled:    false,
  setSettled: () => {},
})

export function LogoProvider({ children }: { children: React.ReactNode }) {
  const [settled, setSettled] = useState(false)
  return (
    <LogoContext.Provider value={{ settled, setSettled }}>
      {children}
    </LogoContext.Provider>
  )
}

export function useLogoSettled() {
  return useContext(LogoContext)
}
