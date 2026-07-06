import 'server-only'
import { db } from '@/lib/db'

export type RecentRow = { id: string; no: string; who: string; status: string; createdAt: Date }

export type DashboardData = {
  enquiriesNew: number
  enquiriesOpen: number
  quotationsDraft: number
  quotationsSent: number
  ordersActive: number
  priceOpen: number
  serviceNew: number
  productsEquipment: number
  productsConsumable: number
  productsSpare: number
  customers: number
  recentEnquiries: RecentRow[]
  recentQuotations: RecentRow[]
}

/** All dashboard numbers + recent activity in one parallel round-trip. */
export async function getDashboardData(): Promise<DashboardData> {
  const [
    enquiriesNew,
    enquiriesOpen,
    quotationsDraft,
    quotationsSent,
    ordersActive,
    priceOpen,
    serviceNew,
    productsEquipment,
    productsConsumable,
    productsSpare,
    customers,
    recentEnquiries,
    recentQuotations,
  ] = await Promise.all([
    db.enquiry.count({ where: { status: 'NEW' } }),
    db.enquiry.count({ where: { status: { in: ['NEW', 'UNDER_REVIEW', 'QUOTED'] } } }),
    db.quotation.count({ where: { status: 'DRAFT' } }),
    db.quotation.count({ where: { status: 'SENT' } }),
    db.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] } } }),
    db.priceRequest.count({ where: { status: 'OPEN' } }),
    db.serviceRequest.count({ where: { status: 'NEW' } }),
    db.product.count({ where: { active: true, type: 'EQUIPMENT' } }),
    db.product.count({ where: { active: true, type: 'CONSUMABLE' } }),
    db.product.count({ where: { active: true, type: 'SPARE_PART' } }),
    db.customer.count(),
    db.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, enquiryNo: true, status: true, createdAt: true, guestName: true, customer: { select: { companyName: true } } },
    }),
    db.quotation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, quotationNo: true, status: true, createdAt: true, customer: { select: { companyName: true } } },
    }),
  ])

  return {
    enquiriesNew,
    enquiriesOpen,
    quotationsDraft,
    quotationsSent,
    ordersActive,
    priceOpen,
    serviceNew,
    productsEquipment,
    productsConsumable,
    productsSpare,
    customers,
    recentEnquiries: recentEnquiries.map((e) => ({
      id: e.id,
      no: e.enquiryNo,
      who: e.customer?.companyName ?? e.guestName ?? 'Guest',
      status: e.status,
      createdAt: e.createdAt,
    })),
    recentQuotations: recentQuotations.map((q) => ({
      id: q.id,
      no: q.quotationNo,
      who: q.customer?.companyName ?? '—',
      status: q.status,
      createdAt: q.createdAt,
    })),
  }
}
