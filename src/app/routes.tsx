import { createHashRouter } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { TimelineView } from '../components/timeline/TimelineView'
import { CompanionPage } from '../components/companion/CompanionPage'
import { ToolsPage } from '../components/tools/ToolsPage'
import { InsightsPage } from '../components/insights/InsightsPage'
import { PrivacyCockpit } from '../components/vault/PrivacyCockpit'

export const routes = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <TimelineView /> },
      { path: 'companion', element: <CompanionPage /> },
      { path: 'tools', element: <ToolsPage /> },
      { path: 'insights', element: <InsightsPage /> },
      { path: 'vault', element: <PrivacyCockpit /> },
    ],
  },
])

