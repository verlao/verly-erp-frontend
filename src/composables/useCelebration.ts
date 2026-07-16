// Comemoração leve ao finalizar um lead: confete + som curto + haptic.
// Sem dependências — canvas + WebAudio + Vibration API. "Endorfina sem exagero":
// respeita prefers-reduced-motion e dura ~1.6s.

let audioCtx: AudioContext | null = null

function playChime() {
  try {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctor) return
    audioCtx = audioCtx || new Ctor()
    const ctx = audioCtx
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99] // C5 · E5 · G5 (acorde ascendente feliz)
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = now + i * 0.09
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.3)
    })
  } catch {
    /* áudio bloqueado (sem gesto do usuário) → silêncio, sem quebrar */
  }
}

function confettiBurst() {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    return
  }
  const colors = ['#2563eb', '#16a34a', '#f59e0b', '#db2777', '#8b5cf6']
  const parts = Array.from({ length: 120 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 140,
    y: canvas.height / 3,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -12 - 4,
    size: 4 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
  }))
  const gravity = 0.35
  const start = performance.now()
  function frame(now: number) {
    const elapsed = now - start
    ctx!.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of parts) {
      p.vy += gravity
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      ctx!.save()
      ctx!.translate(p.x, p.y)
      ctx!.rotate(p.rot)
      ctx!.globalAlpha = Math.max(0, 1 - elapsed / 1600)
      ctx!.fillStyle = p.color
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
      ctx!.restore()
    }
    if (elapsed < 1600) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}

export function useCelebration() {
  function celebrate() {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!reduce) confettiBurst()
    playChime()
    try {
      navigator.vibrate?.([15, 40, 15])
    } catch {
      /* Vibration API indisponível */
    }
  }
  return { celebrate }
}
