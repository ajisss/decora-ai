// Placeholder visual hasil generate (belum ada AI riil) — gradient dari seed.
export default function ResultTile({ loading, seed = 0, className = '' }) {
  const hues = [18, 12, 28, 8, 22, 15, 32, 5]
  const h = hues[seed % hues.length]
  if (loading) {
    return <div className={`aspect-[4/5] animate-pulse rounded-xl2 bg-paper-line ${className}`} />
  }
  return (
    <div
      className={`aspect-[4/5] rounded-xl2 ring-1 ring-black/5 ${className}`}
      style={{
        background: `linear-gradient(150deg, hsl(${h} 45% 64%), hsl(${h + 14} 42% 40%))`,
      }}
    />
  )
}
