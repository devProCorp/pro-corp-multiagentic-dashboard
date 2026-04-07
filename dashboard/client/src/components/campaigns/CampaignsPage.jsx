import { useCampaigns } from '../../hooks/useCampaigns'
import { useTasks } from '../../hooks/useTasks'
import LoadingSpinner from '../shared/LoadingSpinner'
import StatusBadge from '../shared/StatusBadge'
import { formatDate } from '../../utils/formatters'
import { Link } from 'react-router-dom'

export default function CampaignsPage() {
  const { campaigns, loading } = useCampaigns()
  const { tasks } = useTasks()

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Campanas</h1>
        <p className="text-gray-500 text-sm mt-1">Todas las campanas activas y sus entregables</p>
      </div>

      <div className="space-y-4">
        {campaigns.map(campaign => {
          const campaignTasks = tasks.filter(t => t.campaignId === campaign.id)
          return (
            <Link
              key={campaign.id}
              to={`/campaigns/${campaign.id}`}
              className="block bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{campaign.name}</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Cliente: {campaign.client} — ID: {campaign.id} — {formatDate(campaign.fecha)}
                  </p>
                </div>
                <StatusBadge status={campaign.status} />
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progreso general</span>
                  <span>{campaign.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${campaign.progress}%` }}></div>
                </div>
              </div>

              {/* Task summary */}
              <div className="grid grid-cols-5 gap-3">
                {campaign.taskSummary && Object.entries(campaign.taskSummary).map(([key, val]) => (
                  <div key={key} className="text-center">
                    <p className="text-xl font-bold text-white">{val}</p>
                    <p className="text-xs text-gray-500 capitalize">{key}</p>
                  </div>
                ))}
              </div>

              {/* Documents */}
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-500 mb-2">{campaign.documentCount} documentos generados</p>
                <div className="flex flex-wrap gap-2">
                  {campaign.documents?.map(doc => (
                    <span key={doc.fileName} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                      {doc.fileName}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
