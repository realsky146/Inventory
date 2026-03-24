import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { getInventory, type Product } from '../services/sheet'

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<'all' | 'low'>('all')
    const [search, setSearch] = useState('')

    useEffect(() => {
        getInventory().then(data => {
            console.log('Inventory loaded:', data)
            setProducts(data)
            setLoading(false)
        })
    }, [])

    const lowItems = products.filter(i => i.stock < i.min)

    const displayed = products
        .filter(i => tab === 'low' ? i.stock < i.min : true)
        .filter(i => i.name.toLowerCase().includes(search.toLowerCase()) ||
            i.id.toLowerCase().includes(search.toLowerCase()))

    if (loading) return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '60vh', flexDirection: 'column', gap: 16
        }}>
            <div style={{
                width: 40, height: 40,
                border: '4px solid #e5e7eb',
                borderTopColor: '#3730a3',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
            }} />
            <span style={{ color: '#888', fontSize: 14 }}>
                กำลังโหลดข้อมูลจาก Google Sheets...
            </span>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 24
            }}>
                <h1 style={{ fontSize: 26, fontWeight: 700 }}>Inventory</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="badge badge-ai">AI Ready</span>
                    <span style={{ fontSize: 13, color: '#888' }}>
                        ทั้งหมด {products.length} รายการ
                    </span>
                </div>
            </div>

            {/* Alert */}
            {lowItems.length > 0 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderRadius: 10, padding: '12px 16px',
                    marginBottom: 20,
                    fontSize: 13, color: '#dc2626',
                }}>
                    <AlertTriangle size={16} />
                    <span>
                        <strong>สินค้า {lowItems.length} รายการ</strong>
                        {' '}มีสต็อกต่ำกว่าเกณฑ์ — ควรสั่งซื้อเพิ่มเติม
                    </span>
                </div>
            )}

            {/* AI Insight */}
            {lowItems.length > 0 && (
                <div style={{
                    background: '#ede9fe', borderRadius: 10,
                    padding: '12px 18px', marginBottom: 24,
                    fontSize: 13, color: '#5b21b6',
                    borderLeft: '4px solid #7c3aed',
                }}>
                    <strong>AI Insight:</strong>{' '}
                    พบสินค้า {lowItems.length} รายการที่ควรสั่งซื้อเพิ่ม ได้แก่{' '}
                    {lowItems.slice(0, 3).map(i => i.name).join(', ')}
                    {lowItems.length > 3 && ` และอีก ${lowItems.length - 3} รายการ`}
                </div>
            )}

            {/* Search + Tabs */}
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 0
            }}>
                <div className="tabs" style={{ margin: 0, border: 'none' }}>
                    <div
                        className={`tab ${tab === 'all' ? 'active' : ''}`}
                        onClick={() => setTab('all')}
                    >
                        All Product
                    </div>
                    <div
                        className={`tab ${tab === 'low' ? 'active' : ''}`}
                        onClick={() => setTab('low')}
                    >
                        Low Stock{' '}
                        {lowItems.length > 0 && (
                            <span style={{
                                marginLeft: 6, background: '#dc2626', color: '#fff',
                                borderRadius: 10, padding: '1px 7px', fontSize: 11,
                            }}>
                                {lowItems.length}
                            </span>
                        )}
                    </div>
                </div>

                <input
                    type="text"
                    placeholder="ค้นหาสินค้า..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        padding: '8px 14px', borderRadius: 8,
                        border: '1px solid #e5e7eb', fontSize: 13,
                        outline: 'none', width: 220,
                    }}
                />
            </div>

            {/* Table */}
            <div style={{ marginTop: 16 }}>
                {displayed.length === 0 ? (
                    <div style={{
                        background: '#fff', borderRadius: 12, padding: 40,
                        textAlign: 'center', color: '#aaa', fontSize: 14,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}>
                        ไม่พบข้อมูลสินค้า
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Item ID</th>
                                <th>Item Name</th>
                                <th>Current Stock</th>
                                <th>Reorder Threshold</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayed.map((item, idx) => {
                                const isLow = item.stock < item.min
                                return (
                                    <tr key={idx}>
                                        <td style={{ color: '#888', fontSize: 12 }}>{item.id}</td>
                                        <td>{item.name}</td>
                                        <td>
                                            <span style={{
                                                fontWeight: isLow ? 700 : 400,
                                                color: isLow ? '#dc2626' : '#333',
                                            }}>
                                                {item.stock}
                                            </span>
                                        </td>
                                        <td style={{ color: '#aaa' }}>{item.min}</td>
                                        <td>
                                            <span className={`badge ${isLow ? 'badge-low' : 'badge-ok'}`}>
                                                {isLow ? '⚠ ต่ำ' : '✓ ปกติ'}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}