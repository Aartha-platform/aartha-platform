import { BuyerDashboard } from '../types';

export const buyerDashboard: BuyerDashboard = {
  buyerName: 'Rahul Mehta',
  company: 'Mehta Enterprises Pvt. Ltd.',
  lastLogin: 'Today at 9:32 AM',
  stats: {
    savedSearches: 12,
    shortlistedSuppliers: 28,
    rfqsInProgress: 7,
    quotesReceived: 19,
    messages: 8,
    ordersNegotiations: 5,
  },
  rfqStatusData: [
    { label: 'New', value: 10, color: '#3B82F6' },
    { label: 'Quoted', value: 14, color: '#C8972A' },
    { label: 'In Negotiation', value: 12, color: '#8B5CF6' },
    { label: 'Closed', value: 6, color: '#10B981' },
  ],
  recentQuotes: [
    { id: 'rq1', rfqTitle: 'CNC Machine Components', quotesReceived: 6, bestQuote: '$980 / MT', status: 'In Negotiation' },
    { id: 'rq2', rfqTitle: 'Industrial Dyes Bulk Order', quotesReceived: 4, bestQuote: '$1,250 / MT', status: 'Quoted' },
    { id: 'rq3', rfqTitle: 'Woven Fabric - 10,000 mtrs', quotesReceived: 8, bestQuote: '$3.20 / meter', status: 'New' },
    { id: 'rq4', rfqTitle: 'PCB Assembly - 500 units', quotesReceived: 3, bestQuote: '$45 / unit', status: 'Closed' },
  ],
  messages: [
    { id: 'm1', supplierName: 'Ahmedabad Precision Tools', preview: 'We can offer a 5% discount on orders above 500 units...', timestamp: '2 hours ago', unread: true },
    { id: 'm2', supplierName: 'Vadodara Chemicals Ltd.', preview: 'Your RFQ has been reviewed. Please check our quote for...', timestamp: '5 hours ago', unread: true },
    { id: 'm3', supplierName: 'Surat Textile Industries', preview: 'The fabric samples have been dispatched via Blue Dart...', timestamp: 'Yesterday', unread: false },
    { id: 'm4', supplierName: 'Morbi Ceramics International', preview: 'We can meet your specifications. Lead time would be...', timestamp: '2 days ago', unread: false },
  ],
  priceAlerts: [
    { id: 'pa1', commodity: 'Cotton (Shankar-6)', price: '$1,450 / MT', change: 3.2 },
    { id: 'pa2', commodity: 'Caustic Soda', price: '$380 / MT', change: -1.8 },
    { id: 'pa3', commodity: 'Stainless Steel 304', price: '$2,850 / MT', change: 5.4 },
    { id: 'pa4', commodity: 'Polypropylene', price: '$1,120 / MT', change: -2.1 },
  ],
  marketInsight: {
    risingDemand: [
      { topic: 'EV Battery Components', growthPercent: 34 },
      { topic: 'Sustainable Packaging', growthPercent: 28 },
      { topic: 'Medical PPE Kits', growthPercent: 18 },
    ],
    topSearchedItems: [
      'CNC Machine Parts',
      'Industrial Dyes & Pigments',
      'Woven Polyester Fabrics',
      'Pharmaceutical API',
      'Ceramic Floor Tiles',
    ],
    popularCountries: [
      { country: 'USA', percent: 28 },
      { country: 'UAE', percent: 22 },
      { country: 'Germany', percent: 18 },
      { country: 'UK', percent: 15 },
      { country: 'Australia', percent: 17 },
    ],
  },
  verifiedEmail: 'rahul.mehta@mehtaenterprises.com',
  role: 'Purchase Manager',
  purchaseAuthority: 'Up to $500,000',
  sourcingInterests: ['Machinery', 'Chemicals', 'Textiles', 'Electronics'],
  industries: ['Manufacturing', 'Automotive', 'Construction'],
  memberSince: 'March 2022',
};
