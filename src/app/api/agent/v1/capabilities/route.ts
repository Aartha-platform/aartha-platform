import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    return NextResponse.json({
      success: true,
      agentApiVersion: 'v1',
      manifest: {
        platformName: 'Artha B2B Operating System',
        jurisdiction: 'Gujarat, India',
        availableClusters: [
          'pharma-healthcare',
          'chemicals-materials',
          'machinery-industrial',
          'textiles-apparel',
          'packaging-printing',
          'food-agro',
          'electronics-electrical',
          'home-consumer',
        ],
        verificationStandards: [
          'GSTIN_MINISTRY_LOGS',
          'IEC_DGFT_REGISTRY',
          'ONSITE_PHYSICAL_GPS_AUDIT',
          'DIRECTOR_IDENTITY_CHECK',
        ],
        endpointsSupported: {
          searchSuppliers: '/api/agent/v1/suppliers/search',
          supplierProfile: '/api/agent/v1/suppliers/{slug}',
          submitRfq: '/api/agent/v1/rfq',
          directEnquiry: '/api/agent/v1/enquiry',
          pricingBenchmarks: '/api/agent/v1/pricing/{category}',
        },
        mcpContextSchema: {
          protocolVersion: '2024-11-05',
          supportedTools: [
            {
              name: 'search_suppliers',
              description: 'Find physically verified GIDC plants by search queries or category parameters.',
              parameters: {
                type: 'object',
                properties: {
                  q: { type: 'string', description: 'Search term or factory name' },
                  category: { type: 'string', description: 'GIDC industrial vertical key' }
                }
              }
            },
            {
              name: 'submit_enquiry',
              description: 'Send direct factory B2B enquiries using machine-readable JSON-LD schema payloads.',
              parameters: {
                type: 'object',
                properties: {
                  supplierId: { type: 'string' },
                  productName: { type: 'string' },
                  quantity: { type: 'string' },
                  message: { type: 'string' }
                },
                required: ['supplierId', 'productName', 'quantity', 'message']
              }
            }
          ]
        }
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
