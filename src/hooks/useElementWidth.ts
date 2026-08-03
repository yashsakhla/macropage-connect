import { useEffect, useRef, useState } from 'react'

/** Tracks a DOM element's content width via ResizeObserver — used to size
 * third-party widgets (e.g. Google's GoogleLogin button) that require a
 * fixed pixel width instead of accepting a percentage. */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width)
    })
    observer.observe(el)
    setWidth(el.clientWidth)
    return () => observer.disconnect()
  }, [])

  return { ref, width }
}
