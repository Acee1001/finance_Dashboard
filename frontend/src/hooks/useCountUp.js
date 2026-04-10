import { useEffect, useRef, useState } from 'react'

export function useCountUp(target, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const startValRef = useRef(0)

  useEffect(() => {
    if (target === undefined || target === null) return
    const numTarget = Number(target)
    if (isNaN(numTarget)) return

    startValRef.current = value
    startRef.current = null

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Easing: easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = startValRef.current + (numTarget - startValRef.current) * eased
      setValue(parseFloat(current.toFixed(decimals)))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target])

  return value
}
