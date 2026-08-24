export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center gap-3 text-forest py-10 justify-center">
      <div className="h-5 w-5 rounded-full border-2 border-forest border-t-transparent animate-spin" />
      <span className="text-sm font-medium">{label}…</span>
    </div>
  )
}
