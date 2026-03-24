import { useState, useEffect } from 'react'
import {
    LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ChevronDown } from 'lucide-react'
import { getSales, type SaleRow } from '../services/sheet'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function GraphPage() {
    const [allSales, setAllSales] = useState<SaleRow[]>([])
    const [month, setMonth] = useState('Jan')
    const [showPicker, setShowPicker] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getSales().then(data => {
            console.log('✅ Sales loaded:', data)
            setAllSales(data)
            setLoading(false)
            // ตั้ง default month จากข้อมูลแรก
            if (data.length > 0 && data.month) {
                setMonth(data.month)
            }
        })
    }, [])

    const filtered = allSales.filter(r => r.month === month)
    const total = filtered.reduce((s, r) => s + r.quantity_sold, 0)

    const chartData = filtered.map((r, i) => ({
        name: `${i + 1}`,
        value: r.quantity_sold,
    }))

    if (loading) return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '60vh', flexDirection: 'column', gap: 16
        }}>
            <div style={{
                width: 40, height: 40,
                border: '4px solid #e5e7eb', borderTopColor: '#3730a3',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite'
            }} />
            <span style={{ color: '#888', fontSize: 14 }}>
                กำลังโหลดข้อมูลจาก Google Sheets...
            </span>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    )

    return (
        <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Graph</h1>

            <div className="tabs">
                <div className="tab active">All Product</div>
            </div>

            {/* Month Picker */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
                <div
                    onClick={() => setShowPicker(!showPicker)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', border: '1px solid #e5e7eb',
                        borderRadius: 20, cursor: 'pointer', fontSize: 13,
                        background: '#fff', userSelect: 'none',
                    }}
                >
                    {month} <ChevronDown size={14} />
                </div>

                {showPicker && (
                    <div style={{
                        position: 'absolute', top: '110%', left: 0,
                        background: '#fff', border: '1px solid #e5e7eb',
                        borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        zIndex: 100, padding: 10,
                        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
                        gap: 4, width: 180,
                    }}>
                        {MONTHS.map(m => (
                            <div
                                key={m}
                                onClick={() => { setMonth(m); setShowPicker(false) }}
                                style={{
                                    padding: '7px 8px', cursor: 'pointer', borderRadius: 6,
                                    fontSize: 13, textAlign: 'center',
                                    background: month === m ? '#ede9fe' : 'transparent',
                                    color: month === m ? '#5b21b6' : '#333',
                                    fontWeight: month === m ? 600 : 400,
                                }}
                            >
                                {m}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Chart + Stat */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20, marginBottom: 24 }}>
                <div style={{
                    background: '#fff', borderRadius: 12, padding: 20,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Line
                                    type="monotone" dataKey="value"
                                    stroke="#3730a3" strokeWidth={2}
                                    dot={{ fill: '#3730a3', r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{
                            height: 220, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#aaa', fontSize: 13,
                        }}>
                            ไม่มีข้อมูลในเดือน {month}
                        </div>
                    )}
                </div>

                <div style={{
                    background: '#fff', borderRadius: 12, padding: 24,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{ fontSize: 48, fontWeight: 700, color: '#3730a3' }}>
                        {total}
                    </div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 6, textAlign: 'center' }}>
                        Quantity Sold Total
                    </div>
                </div>
            </div>

            {/* Table */}
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Datetime</th>
                        <th>Item Name</th>
                        <th>Quantity Sold</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={4} style={{ textAlign: 'center', color: '#aaa', padding: 32 }}>
                                ไม่มีข้อมูลในเดือน {month}
                            </td>
                        </tr>
                    ) : (
                        filtered.map((row, idx) => (
                            <tr key={idx}>
                                <td style={{ color: '#888', fontSize: 12 }}>{row.order_id}</td>
                                <td style={{ color: '#888', fontSize: 13 }}>{row.datetime}</td>
                                <td>{row.product_name}</td>
                                <td style={{ fontWeight: 600 }}>{row.quantity_sold}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}