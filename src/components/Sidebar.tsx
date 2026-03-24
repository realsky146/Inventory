import { Package, TrendingUp, FileText } from 'lucide-react'
import logo from '../assets/logo.png'  // ← เปลี่ยนนามสกุลตามไฟล์จริง

type Page = 'inventory' | 'graph' | 'purchase'

interface SidebarProps {
    activePage: Page
    setActivePage: (page: Page) => void
}

const NAV = [
    { id: 'inventory' as Page, icon: <Package size={20} />, label: 'Inventory' },
    { id: 'graph' as Page, icon: <TrendingUp size={20} />, label: 'Graph' },
    { id: 'purchase' as Page, icon: <FileText size={20} />, label: 'Purchase Orders' },
]

export default function Sidebar({ activePage, setActivePage }: SidebarProps) {
    return (
        <div style={{
            width: 64,
            background: '#111827',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 0',
            gap: 8,
            flexShrink: 0,
        }}>
            {/* Logo */}
            <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                overflow: 'hidden',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1f2937',
            }}>
                <img
                    src={logo}
                    alt="StockAI"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            {/* Nav Icons */}
            {NAV.map(({ id, icon, label }) => (
                <div
                    key={id}
                    title={label}
                    onClick={() => setActivePage(id)}
                    style={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        cursor: 'pointer',
                        color: activePage === id ? '#fff' : '#6b7280',
                        background: activePage === id ? '#374151' : 'transparent',
                        transition: 'all 0.15s',
                    }}
                >
                    {icon}
                </div>
            ))}

            {/* App Name */}
            <div style={{
                position: 'absolute',
                bottom: 16,
                fontSize: 9,
                color: '#4b5563',
                fontWeight: 600,
                letterSpacing: 1,
            }}>
                StockAI
            </div>
        </div>
    )
}