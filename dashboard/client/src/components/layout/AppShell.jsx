import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar />
      <main className="ml-60 p-6">
        <Outlet />
      </main>
    </div>
  )
}
