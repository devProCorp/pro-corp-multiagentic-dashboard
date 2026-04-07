import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import DashboardPage from './components/dashboard/DashboardPage'
import CampaignsPage from './components/campaigns/CampaignsPage'
import CampaignDetail from './components/campaigns/CampaignDetail'
import TasksPage from './components/tasks/TasksPage'
import AgentsPage from './components/agents/AgentsPage'
import AgentDetail from './components/agents/AgentDetail'
import OrchestrationPage from './components/orchestration/OrchestrationPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/agents/:slug" element={<AgentDetail />} />
        <Route path="/orchestration" element={<OrchestrationPage />} />
      </Route>
    </Routes>
  )
}
