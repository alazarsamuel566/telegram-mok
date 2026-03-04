'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isAnimatingRef = useRef(false)
  const lockedTargetRef = useRef<number | null>(null)
  const maxScroll = 120

  const stories = [
    { name: 'You', color: '#3b82f6' },
    { name: 'Alice', color: '#ec4899' },
    { name: 'Bob', color: '#8b5cf6' },
    { name: 'Charlie', color: '#10b981' },
    { name: 'Diana', color: '#f59e0b' },
    { name: 'Eve', color: '#ef4444' },
    { name: 'Frank', color: '#06b6d4' },
    { name: 'Grace', color: '#84cc16' },
  ]

  const chats = [
    { name: 'Alice Johnson', message: 'Hey! How are you doing?', time: '12:30', unread: 2, online: true },
    { name: 'Bob Smith', message: 'The meeting is confirmed for tomorrow', time: '11:45', unread: 0, online: false },
    { name: 'Charlie Brown', message: 'Thanks for the help! 🙏', time: '10:20', unread: 0, online: true },
    { name: 'Diana Ross', message: 'Check out this awesome photo!', time: 'Yesterday', unread: 5, online: false },
    { name: 'Eve Williams', message: 'Can you call me later?', time: 'Yesterday', unread: 0, online: false },
    { name: 'Frank Miller', message: 'I sent you the documents', time: 'Monday', unread: 1, online: true },
    { name: 'Grace Lee', message: 'Happy birthday! 🎂🎉', time: 'Monday', unread: 0, online: false },
    { name: 'Henry Chen', message: 'See you at the party!', time: 'Sunday', unread: 0, online: false },
    { name: 'Ivy Thompson', message: 'That sounds great! Let me know', time: 'Sunday', unread: 0, online: true },
    { name: 'Jack Wilson', message: 'Did you watch the game last night?', time: 'Sat', unread: 3, online: false },
    { name: 'Kate Anderson', message: 'The project deadline is next week', time: 'Sat', unread: 0, online: false },
    { name: 'Liam Garcia', message: '☕ Coffee tomorrow?', time: 'Fri', unread: 0, online: true },
    { name: 'Mia Martinez', message: 'I finished the report you asked for', time: 'Fri', unread: 8, online: false },
    { name: 'Noah Robinson', message: 'Where should we meet?', time: 'Thu', unread: 0, online: false },
    { name: 'Olivia Clark', message: 'Just got back from vacation! 🏖️', time: 'Thu', unread: 0, online: true },
    { name: 'Peter Lewis', message: 'Can you review my code?', time: 'Wed', unread: 1, online: false },
    { name: 'Quinn Walker', message: 'The concert was amazing! 🎵', time: 'Wed', unread: 0, online: false },
    { name: 'Rachel Hall', message: 'Happy New Year! 🎆', time: 'Tue', unread: 0, online: true },
    { name: 'Sam Young', message: 'I will send the files soon', time: 'Tue', unread: 0, online: false },
    { name: 'Tina King', message: 'Are you coming to the event?', time: 'Jan 15', unread: 4, online: false },
    { name: 'Uma Scott', message: 'Thanks for the recommendation!', time: 'Jan 14', unread: 0, online: true },
    { name: 'Victor Adams', message: 'Let\'s schedule a call', time: 'Jan 13', unread: 0, online: false },
    { name: 'Wendy Baker', message: 'The design looks perfect! 👍', time: 'Jan 12', unread: 0, online: false },
    { name: 'Xavier Nelson', message: 'Meeting rescheduled to 3pm', time: 'Jan 11', unread: 2, online: true },
    { name: 'Yolanda Hill', message: 'Did you receive my email?', time: 'Jan 10', unread: 0, online: false },
    { name: 'Zack Moore', message: 'Great presentation today!', time: 'Jan 9', unread: 0, online: false },
  ]

  // Animate to target scroll - always completes fully
  const animateToTarget = useCallback((targetScroll: number, duration: number = 200, startFrom?: number) => {
    const container = chatContainerRef.current
    if (!container) return

    // If already animating to the same target, let it continue
    if (isAnimatingRef.current && lockedTargetRef.current === targetScroll) {
      return
    }

    // Cancel any existing animation only if target is different
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Lock the target for this animation
    lockedTargetRef.current = targetScroll
    isAnimatingRef.current = true
    
    // Use provided start position or read from container
    const startScroll = startFrom !== undefined ? startFrom : container.scrollTop
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const rawProgress = Math.min(elapsed / duration, 1)
      // Smooth ease-out cubic
      const eased = 1 - Math.pow(1 - rawProgress, 3)
      const target = lockedTargetRef.current!
      const currentScroll = startScroll + (target - startScroll) * eased
      
      // Set both together
      container.scrollTop = currentScroll
      setScrollY(currentScroll)

      if (rawProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Ensure exact target is reached
        container.scrollTop = target
        setScrollY(target)
        isAnimatingRef.current = false
        lockedTargetRef.current = null
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [])

  // Snap to nearest edge
  const snapToNearest = useCallback(() => {
    const container = chatContainerRef.current
    if (!container) return

    const currentScroll = container.scrollTop
    if (currentScroll <= 0 || currentScroll >= maxScroll) return

    const progress = currentScroll / maxScroll
    const targetScroll = progress >= 0.5 ? maxScroll : 0
    
    // Animate directly with current scroll as start position
    animateToTarget(targetScroll, 250, currentScroll)
  }, [animateToTarget])

  // Handle scroll event
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isAnimatingRef.current) return
    setScrollY(e.currentTarget.scrollTop)
  }

  // Touch screen
  const handleTouchEnd = () => {
    const container = chatContainerRef.current
    if (!container || isAnimatingRef.current) return
    
    if (container.scrollTop > 0 && container.scrollTop < maxScroll) {
      setTimeout(() => {
        snapToNearest()
      }, 30)
    }
  }

  // Cleanup
  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return
    
    let lastScrollPosition = 0
    let stabilityCount = 0

    const handleNativeWheel = (e: WheelEvent) => {
      const currentScroll = container.scrollTop
      const delta = Math.abs(e.deltaY)
      const scrollingDown = e.deltaY > 0
      const scrollingUp = e.deltaY < 0

      // If animating, prevent any wheel interference
      if (isAnimatingRef.current) {
        e.preventDefault()
        return
      }

      // Clear existing timeout
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current)
        wheelTimeoutRef.current = null
      }

      // Mouse wheel: large delta (>= 50)
      if (delta >= 50) {
        // Scrolling down - animate to maxScroll (collapse stories)
        if (scrollingDown && currentScroll < maxScroll) {
          e.preventDefault()
          animateToTarget(maxScroll, 180)
        }
        // Scrolling up - animate to 0 (expand stories)
        else if (scrollingUp && currentScroll <= maxScroll + 50 && currentScroll > 0) {
          e.preventDefault()
          animateToTarget(0, 180)
        }
      }
      // Touchpad: small delta (< 50)
      else if (currentScroll > 0 && currentScroll < maxScroll) {
        // Reset stability counter on each wheel event
        stabilityCount = 0
        lastScrollPosition = currentScroll
        
        // Snap when wheel events stop AND scroll is stable
        const checkAndSnap = (capturedPosition: number) => {
          const scrollNow = container.scrollTop
          
          // Check if scroll position is stable
          if (Math.abs(scrollNow - lastScrollPosition) < 0.5) {
            stabilityCount++
            if (stabilityCount >= 2) {
              // Scroll is stable, now snap from captured position
              if (scrollNow > 0 && scrollNow < maxScroll && !isAnimatingRef.current) {
                const progress = scrollNow / maxScroll
                const targetScroll = progress >= 0.5 ? maxScroll : 0
                // Use longer duration for smoother snap
                animateToTarget(targetScroll, 300, scrollNow)
              }
              return
            }
          } else {
            // Position changed, reset
            stabilityCount = 0
            lastScrollPosition = scrollNow
          }
          
          // Continue checking
          wheelTimeoutRef.current = setTimeout(() => checkAndSnap(scrollNow), 30)
        }
        
        // Initial delay before starting stability check
        wheelTimeoutRef.current = setTimeout(() => checkAndSnap(currentScroll), 50)
      }
    }

    container.addEventListener('wheel', handleNativeWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleNativeWheel)
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [animateToTarget, snapToNearest])

  // Animation calculations
  const progress = Math.min(scrollY / maxScroll, 1)
  const storySectionOpacity = 1 - progress
  const storySectionHeight = 88 * (1 - progress)
  const textProgress = Math.min(progress * 2, 1)
  const textScale = 1 - (textProgress * 0.5)
  const textOpacity = 1 - textProgress

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '360px',
        height: '100vh',
        background: '#17212b',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 12px 24px -8px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Animated Story Icons */}
        {stories.map((story, index) => {
          const visibleInCollapsed = index < 4
          const initialX = 12 + (index * 72)
          const initialY = 68
          const stackOffset = index * 6
          const targetX = 12 + stackOffset
          const targetY = 0
          const currentX = initialX + (targetX - initialX) * progress
          const currentY = initialY + (targetY - initialY) * progress
          const currentSize = 56 - (progress * 32)
          const currentScale = currentSize / 56
          const opacity = visibleInCollapsed ? 1 : (1 - progress)
          
          return (
            <div key={index} style={{
              position: 'absolute',
              left: currentX,
              top: currentY,
              zIndex: 100 + (stories.length - index),
              opacity: opacity,
              pointerEvents: 'none'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${story.color}, ${story.color}dd)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '1.1rem',
                boxShadow: `0 0 0 2px #17212b, 0 0 0 4px ${story.color}`,
                transform: `scale(${currentScale})`,
                transformOrigin: 'center center'
              }}>
                {story.name[0]}
              </div>
              <div style={{ textAlign: 'center', marginTop: '4px', opacity: 1 - progress }}>
                <span style={{
                  color: '#8b9ba5',
                  fontSize: '0.75rem',
                  display: progress >= 0.5 ? 'none' : 'block'
                }}>
                  {story.name}
                </span>
              </div>
            </div>
          )
        })}

        {/* Header */}
        <div style={{
          background: '#242f3d',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 20,
          height: '56px',
          flexShrink: 0
        }}>
          <span style={{
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: '600',
            transform: `scale(${textScale})`,
            opacity: textOpacity,
            transformOrigin: 'left center',
            whiteSpace: 'nowrap',
            position: 'absolute',
            left: '16px'
          }}>
            Telegram
          </span>
          
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ cursor: 'pointer', position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>

        {/* Stories Section */}
        <div style={{
          background: '#17212b',
          borderBottom: `1px solid rgba(43, 58, 74, ${storySectionOpacity})`,
          height: storySectionHeight > 0 ? storySectionHeight : 0,
          opacity: storySectionOpacity,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          flexShrink: 0
        }} />

        {/* Chat Section */}
        <div 
          ref={chatContainerRef}
          onScroll={handleScroll}
          onTouchEnd={handleTouchEnd}
          style={{
            flex: 1,
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            touchAction: 'pan-y'
          }}
        >
          <div style={{ padding: '12px 16px 8px', background: '#17212b', position: 'sticky', top: 0, zIndex: 5 }}>
            <span style={{ color: '#8b9ba5', fontSize: '0.85rem', fontWeight: '500' }}>Chats</span>
          </div>

          <div>
            {chats.map((chat, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderBottom: '1px solid #2b3a4a',
                cursor: 'pointer',
                background: 'transparent'
              }}>
                <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #4a90d9, #67b26f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '1rem', flexShrink: 0 }}>
                  {chat.name[0]}
                  {chat.online && <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', background: '#4ade80', borderRadius: '50%', border: '2px solid #17212b' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: '500' }}>{chat.name}</span>
                    <span style={{ color: '#8b9ba5', fontSize: '0.75rem' }}>{chat.time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#8b9ba5', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{chat.message}</span>
                    {chat.unread > 0 && <div style={{ background: '#3b82f6', color: 'white', fontSize: '0.7rem', fontWeight: '600', minWidth: '20px', height: '20px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>{chat.unread}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Action Button */}
        <div style={{ position: 'absolute', bottom: '24px', right: '24px', width: '56px', height: '56px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)', cursor: 'pointer', zIndex: 30 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M20 12h-7V5h-2v7H4v2h7v7h2v-7h7z"/>
          </svg>
        </div>
      </div>
    </div>
  )
}
