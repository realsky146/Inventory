import { useState } from 'react'
import Sidebar from './components/Sidebar'
import InventoryPage from './pages/InventoryPage'
import GraphPage from './pages/GraphPage'
import PurchaseOrderPage from './pages/PurchaseOrderPage'

type Page = 'inventory' | 'graph' | 'purchase'

function App() {
  const [activePage, setActivePage] = useState<Page>('inventory')

  const renderPage = () => {
    switch (activePage) {
      case 'inventory': return <InventoryPage />
      case 'graph': return <GraphPage />
      case 'purchase': return <PurchaseOrderPage />
      default: return <InventoryPage />
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '32px 40px',
        background: '#f8f8f8'
      }}>
        {renderPage()}
      </main>
    </div>
  )
}

export default App