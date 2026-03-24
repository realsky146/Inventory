const SHEET_ID = '1LaRFpdlunNMql91kscvHOSBuk9QKfJaaHDMvn5J4UNI'

const GID = {
    inventory: '0',
    sales: '895343946',
    orders: '1015645310',
}

const fetchCSV = async (gid: string): Promise<string[][]> => {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`
    const res = await fetch(url)
    const text = await res.text()
    return text.split('\n').map(row =>
        row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
    )
}

const toObjects = (rows: string[][]): Record<string, string>[] => {
    const [headers, ...data] = rows
    return data
        .filter(row => row.some(cell => cell !== ''))
        .map(row =>
            Object.fromEntries(headers.map((h, i) => [h.trim(), row[i]?.trim() ?? '']))
        )
}

const extractMonth = (datetime: string): string => {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    try {
        const date = new Date(datetime)
        return MONTHS[date.getMonth()] ?? ''
    } catch {
        return ''
    }
}

export interface Product {
    id: string
    name: string
    stock: number
    min: number
}

export interface SaleRow {
    order_id: string
    datetime: string
    item_id: string
    product_name: string
    quantity_sold: number
    month: string
}

export interface Order {
    order_id: string
    datetime: string
    item_id: string
    suggested_order_size: number
    ai_reasoning: string
    status: string
}

export const getInventory = async (): Promise<Product[]> => {
    try {
        const rows = await fetchCSV(GID.inventory)
        const objs = toObjects(rows)
        console.log('📦 Inventory:', objs)
        return objs.map(r => ({
            id: r['Item ID'] ?? '',
            name: r['Item Name'] ?? '',
            stock: Number(r['Current Stock'] || 0),
            min: Number(r['Reorder Threshold'] || 0),
        }))
    } catch (e) {
        console.error('getInventory error:', e)
        return []
    }
}

export const getSales = async (month?: string): Promise<SaleRow[]> => {
    try {
        const rows = await fetchCSV(GID.sales)
        const objs = toObjects(rows)
        console.log('📊 Sales:', objs)
        const all = objs.map(r => ({
            order_id: r['Order ID'] ?? '',
            datetime: r['Datetime'] ?? '',
            item_id: r['Item ID'] ?? '',
            product_name: r['Item Name'] ?? '',
            quantity_sold: Number(r['Quantity Sold'] || 0),
            month: extractMonth(r['Datetime'] ?? ''),
        }))
        return month ? all.filter(r => r.month === month) : all
    } catch (e) {
        console.error('getSales error:', e)
        return []
    }
}

export const getOrders = async (): Promise<Order[]> => {
    try {
        const rows = await fetchCSV(GID.orders)
        const objs = toObjects(rows)
        console.log('🛒 Orders:', objs)
        return objs.map(r => ({
            order_id: r['Order ID'] ?? '',
            datetime: r['Datetime'] ?? '',
            item_id: r['Item ID'] ?? '',
            suggested_order_size: Number(r['Suggested Order Size'] || 0),
            ai_reasoning: r['AI Reasoning'] ?? '',
            status: r['Status'] ?? 'Pending',
        }))
    } catch (e) {
        console.error('getOrders error:', e)
        return []
    }
}