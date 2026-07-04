import { useEffect } from 'react'

/**
 * Toast notification shown in the top-right corner.
 * Props:
 *   message    — string to display
 *   onRetry    — optional callback; shows "Reintentar" button if provided
 *   onClose    — callback to dismiss the toast
 *   duration   — ms before auto-dismiss (default 5000, 0 = no auto-dismiss)
 */
export default function Toast({ message, onRetry, onClose, duration = 5000 }) {
  useEffect(() => {
    if (!duration) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-red-600 text-white rounded-xl shadow-lg px-4 py-3 flex items-start gap-3">
        <span className="text-lg flex-shrink-0">⚠</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium break-words">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-1.5 text-xs underline hover:no-underline opacity-90 hover:opacity-100"
            >
              Reintentar
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 text-white text-sm leading-none"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
