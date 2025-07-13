
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Listen for changes
    mql.addEventListener("change", onChange)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Hook adicional para diferentes breakpoints
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'sm' | 'md' | 'lg' | 'xl'>('lg')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < 640) setBreakpoint('sm')
      else if (width < 768) setBreakpoint('md')
      else if (width < 1024) setBreakpoint('lg')
      else setBreakpoint('xl')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}
