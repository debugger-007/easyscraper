/**
 * High-performance smooth scrolling utility.
 * Uses requestAnimationFrame with an ease-out curve to provide instantaneous (0ms delay)
 * response on click, eliminating the 300-500ms startup lag of Safari/WebKit's native smooth scroll.
 */

let activeRafId: number | null = null

// Ease-out quart: high initial kick (zero perceived delay) with a silky-smooth deceleration
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

export function scrollToSection(targetId: string, onComplete?: () => void) {
  // Cancel any ongoing smooth scroll animation immediately
  if (activeRafId !== null) {
    cancelAnimationFrame(activeRafId)
    activeRafId = null
  }

  const headerHeight = 64
  const startY = window.pageYOffset || document.documentElement.scrollTop
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

  let targetY = 0
  if (targetId !== 'hero') {
    const el = document.getElementById(targetId)
    if (!el) {
      if (onComplete) onComplete()
      return
    }
    const rect = el.getBoundingClientRect()
    targetY = rect.top + startY - headerHeight
  }

  targetY = Math.max(0, Math.min(targetY, maxScroll))
  const distance = targetY - startY

  // If already at the target position, finish immediately
  if (Math.abs(distance) < 2) {
    window.scrollTo(0, targetY)
    if (onComplete) onComplete()
    return
  }

  // Fast, responsive duration: between 300ms and 480ms depending on distance
  const duration = Math.min(480, Math.max(300, Math.round(Math.abs(distance) * 0.2)))
  const startTime = performance.now()

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(1, elapsed / duration)
    const easedProgress = easeOutQuart(progress)
    const currentY = Math.round(startY + distance * easedProgress)

    window.scrollTo(0, currentY)

    if (progress < 1) {
      activeRafId = requestAnimationFrame(step)
    } else {
      window.scrollTo(0, targetY)
      activeRafId = null
      if (onComplete) {
        onComplete()
      }
    }
  }

  // Kick off on the very next frame with zero latency
  activeRafId = requestAnimationFrame(step)
}
