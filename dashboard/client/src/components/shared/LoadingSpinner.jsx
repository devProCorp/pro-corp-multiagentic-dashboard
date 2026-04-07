export default function LoadingSpinner({ text = 'Cargando...' }) {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
      <span className="text-gray-400">{text}</span>
    </div>
  )
}
