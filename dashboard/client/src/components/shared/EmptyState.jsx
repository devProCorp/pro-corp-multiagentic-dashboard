export default function EmptyState({ title, description }) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-400 text-lg">{title}</p>
      {description && <p className="text-gray-500 mt-2 text-sm">{description}</p>}
    </div>
  )
}
