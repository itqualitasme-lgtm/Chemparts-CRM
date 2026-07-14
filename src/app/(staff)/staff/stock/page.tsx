import { requirePortal } from '@/lib/auth/session'
import { db } from '@/lib/db'
import PageHeader from '@/components/ui/PageHeader'
import StockTable, { type StockRow } from './StockTable'

export const metadata = { title: 'Stock - Chemparts Staff' }
export const dynamic = 'force-dynamic'

export default async function StockPage() {
  await requirePortal('staff')

  const products = await db.product.findMany({
    orderBy: [{ stockStatus: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      modelNo: true,
      stockStatus: true,
      stockTracked: true,
      brand: { select: { name: true } },
    },
  })

  const rows: StockRow[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    modelNo: p.modelNo,
    brand: p.brand.name,
    stockStatus: p.stockStatus,
    stockTracked: p.stockTracked,
  }))

  const counts = {
    IN_STOCK: rows.filter((r) => r.stockStatus === 'IN_STOCK').length,
    ON_ORDER: rows.filter((r) => r.stockStatus === 'ON_ORDER').length,
    OUT_OF_STOCK: rows.filter((r) => r.stockStatus === 'OUT_OF_STOCK').length,
  }

  return (
    <div>
      <PageHeader
        title="Stock"
        subtitle={`${rows.length} products · ${counts.IN_STOCK} in stock · ${counts.ON_ORDER} on order · ${counts.OUT_OF_STOCK} out of stock.`}
      />
      <StockTable rows={rows} />
    </div>
  )
}
