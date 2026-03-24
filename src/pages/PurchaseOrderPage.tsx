import { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Download } from 'lucide-react'
import { getOrders, getInventory } from '../services/sheet'
import type { Order, Product } from '../services/sheet'

export default function PurchaseOrderPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [note, setNote] = useState('')

    const today = new Date()
    const dateStr = today.toLocaleDateString('th-TH', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    })
    const timeStr = today.toLocaleTimeString('th-TH', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    })

    useEffect(() => {
        Promise.all([getOrders(), getInventory()]).then(([o, p]) => {
            setOrders(o)
            setProducts(p)
            setLoading(false)
        })
    }, [])

    const getProductName = (item_id: string) =>
        products.find(p => p.id === item_id)?.name ?? `Item ${item_id}`

    const handleSavePDF = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('Purchase Order', 105, 22, { align: 'center' })

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text(`Date: ${dateStr}`, 20, 35)
        doc.text(`Time: ${timeStr}`, 20, 41)
        doc.text(`From: ${fromDate || '........'}   To: ${toDate || '........'}`, 20, 47)
        doc.text(`Note: ${note || '-'}`, 20, 53)

        autoTable(doc, {
            startY: 62,
            head: [['Order ID', 'Datetime', 'Item Name', 'Suggested Order', 'AI Reasoning', 'Status']],
            body: orders.map(o => [
                o.order_id,
                o.datetime,
                getProductName(o.item_id),
                o.suggested_order_size,
                o.ai_reasoning || '-',
                o.status,
            ]),
            headStyles: { fillColor: [55, 48, 163], fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: { 2: { halign: 'left' }, 4: { halign: 'left' } },
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalY = (doc as any).lastAutoTable.finalY + 30
        doc.text('Sign Owner', 70, finalY, { align: 'center' })
        doc.line(35, finalY + 8, 105, finalY + 8)
        doc.text('Sign Supplier', 145, finalY, { align: 'center' })
        doc.line(110, finalY + 8, 180, finalY + 8)

        doc.save(`PurchaseOrder-${dateStr}.pdf`)
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '60vh',
                flexDirection: 'column',
                gap: 16,
            }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: '4px solid #e5e7eb',
                    borderTopColor: '#3730a3',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <span style={{ color: '#888', fontSize: 14 }}>
                    กำลังโหลดข้อมูลจาก Google Sheets...
                </span>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
        )
    }

    return (
        <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>
                Purchase Orders
            </h1>

            <div className="tabs">
                <div className="tab active">All Product</div>
            </div>

            <button
                onClick={handleSavePDF}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 18px',
                    background: '#3730a3',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    marginBottom: 28,
                }}
            >
                <Download size={15} /> Save as PDF
            </button>

            <div className="po-doc">
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>รายการสั่งซื้อสินค้า</div>
                </div>

                <div style={{ fontSize: 12, color: '#555', lineHeight: 2.2 }}>
                    <div>Date: {dateStr}</div>
                    <div>Time: {timeStr}</div>
                    <div style={{ display: 'flex', gap: 24 }}>
                        <span>
                            From:{' '}
                            <input
                                type="date"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                                style={{
                                    border: 'none',
                                    borderBottom: '1px solid #aaa',
                                    outline: 'none',
                                    fontSize: 12,
                                }}
                            />
                        </span>
                        <span>
                            To:{' '}
                            <input
                                type="date"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                                style={{
                                    border: 'none',
                                    borderBottom: '1px solid #aaa',
                                    outline: 'none',
                                    fontSize: 12,
                                }}
                            />
                        </span>
                    </div>
                    <div>
                        Note:{' '}
                        <input
                            type="text"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="หมายเหตุ..."
                            style={{
                                border: 'none',
                                borderBottom: '1px solid #aaa',
                                outline: 'none',
                                fontSize: 12,
                                width: 280,
                            }}
                        />
                    </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 20, marginBottom: 4 }}>
                    Orders
                </div>

                <table className="po-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Datetime</th>
                            <th>Item Name</th>
                            <th>Suggested Order</th>
                            <th>AI Reasoning</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    style={{ textAlign: 'center', color: '#aaa', padding: 24 }}
                                >
                                    ยังไม่มีข้อมูลใน Google Sheets
                                </td>
                            </tr>
                        ) : (
                            orders.map((o, idx) => (
                                <tr key={idx}>
                                    <td>{o.order_id}</td>
                                    <td style={{ fontSize: 11 }}>{o.datetime}</td>
                                    <td style={{ textAlign: 'left' }}>{getProductName(o.item_id)}</td>
                                    <td style={{ color: '#3730a3', fontWeight: 600 }}>
                                        {o.suggested_order_size}
                                    </td>
                                    <td style={{ textAlign: 'left', fontSize: 11, color: '#666' }}>
                                        {o.ai_reasoning || '-'}
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: 12,
                                            fontSize: 11,
                                            background: o.status === 'Pending' ? '#fef9c3' : '#f0fdf4',
                                            color: o.status === 'Pending' ? '#854d0e' : '#16a34a',
                                        }}>
                                            {o.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 40 }}>
                    {['Sign Owner', 'Sign Supplier'].map(label => (
                        <div key={label} style={{ textAlign: 'center', fontSize: 12 }}>
                            <div>{label}</div>
                            <div style={{
                                width: 160,
                                borderBottom: '1px solid #333',
                                margin: '28px auto 8px',
                            }} />
                            <div style={{ color: '#aaa', fontSize: 11 }}>
                                ( ................................. )
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}