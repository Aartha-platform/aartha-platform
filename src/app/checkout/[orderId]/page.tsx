'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCsrfToken } from '@/lib/csrfClient';
import Header from '@/components/Header';
import {
  ShieldCheck,
  Lock,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Building2,
  DollarSign,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  specification: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderData {
  id: string;
  poNumber: string;
  buyerEmail: string;
  buyerName: string;
  buyerCompany: string;
  supplierId: string;
  supplierSlug: string;
  supplierCompany: string;

  items: OrderItem[];
  subtotalAmount: number;
  platformFeeAmount: number;
  totalAmount: number;
  currency: string;

  tradeAssuranceStatus: string;
  status: string;

  razorpayOrderId?: string;
  razorpayPaymentId?: string;

  shippingDetails?: {
    carrier: string;
    trackingId: string;
    estimatedDelivery: string;
    shippedAt: string;
  };
  inspectionPeriodDays: number;
  inspectionEndsAt?: string;

  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  releasedAt?: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [isProcessing, setIsProcessing] = useState(false);
  const [carrierInput, setCarrierInput] = useState('VRL Logistics GIDC');
  const [trackingInput, setTrackingInput] = useState('');
  const [showShipModal, setShowShipModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  const [disputeReason, setDisputeReason] = useState('Quality Defect');
  const [disputeDesc, setDisputeDesc] = useState('');

  // Fetch Order Details
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/trade-assurance/orders/${orderId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load order details.');
        return;
      }
      setOrder(data.order);
    } catch {
      setError('Network error loading order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  // Load Razorpay Script dynamically
  useEffect(() => {
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Handle Razorpay Payment
  const handleSecurePayment = async () => {
    if (!order) return;
    setIsProcessing(true);
    setError('');

    try {
      const options = {
        key: (order as any)?.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: order.totalAmount,
        currency: order.currency || 'INR',
        name: 'Aartha Network',
        description: `Payment for PO ${order.poNumber}`,
        order_id: order.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Verify on server
            const verifyRes = await fetch('/api/trade-assurance/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': getCsrfToken(),
              },
              credentials: 'same-origin',
              body: JSON.stringify({
                orderId: order.id,
                razorpayPaymentId: response.razorpay_payment_id || `pay_mock_${Date.now()}`,
                razorpayOrderId: response.razorpay_order_id || order.razorpayOrderId,
                razorpaySignature: response.razorpay_signature || 'verified_sig',
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              window.history.replaceState(null, '', window.location.pathname);
              fetchOrder();
            } else {
              setError(verifyData.error || 'Payment verification failed.');
            }
          } catch {
            setError('Network error during payment verification. Please check order status.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setError('Payment was cancelled. You can retry when ready.');
          },
        },
        prefill: {
          name: order.buyerName,
          email: order.buyerEmail,
        },
        theme: {
          color: '#0A192F',
        },
      };

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          setIsProcessing(false);
          setError(`Payment failed: ${response.error?.description || 'Transaction declined'}`);
        });
        rzp.open();
      } else {
        // Fallback simulated payment for dev environment
        const verifyRes = await fetch('/api/trade-assurance/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCsrfToken(),
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            orderId: order.id,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpayOrderId: order.razorpayOrderId,
          }),
        });
        if (verifyRes.ok) {
          window.history.replaceState(null, '', window.location.pathname);
          fetchOrder();
        } else {
          const d = await verifyRes.json();
          setError(d.error || 'Simulated payment verification failed.');
        }
        setIsProcessing(false);
      }
    } catch (e: any) {
      setError(e.message || 'Error processing Razorpay payment.');
      setIsProcessing(false);
    }
  };

  // Supplier Dispatch Handler
  const handleMarkShipped = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/trade-assurance/ship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify({
          orderId: order?.id,
          carrier: carrierInput,
          trackingId: trackingInput,
        }),
      });
      if (res.ok) {
        setShowShipModal(false);
        fetchOrder();
      } else {
        const d = await res.json();
        setError(d.error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Buyer Delivery Confirm
  const handleConfirmDelivery = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/trade-assurance/confirm-delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify({ orderId: order?.id }),
      });
      if (res.ok) fetchOrder();
    } finally {
      setIsProcessing(false);
    }
  };

  // Buyer Release Funds
  const handleAcceptRelease = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/trade-assurance/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify({ orderId: order?.id }),
      });
      if (res.ok) fetchOrder();
    } finally {
      setIsProcessing(false);
    }
  };

  // Raise Dispute
  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDesc) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/trade-assurance/dispute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify({
          orderId: order?.id,
          raisedByRole: 'buyer',
          raisedByEmail: order?.buyerEmail,
          reason: disputeReason,
          description: disputeDesc,
        }),
      });
      if (res.ok) {
        setShowDisputeModal(false);
        fetchOrder();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] font-sans">
        <Header />
        <div className="max-w-4xl mx-auto py-24 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xs text-text-muted dark:text-slate-400 font-semibold">Loading Aartha Protect...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--bg)] font-sans">
        <Header />
        <div className="max-w-xl mx-auto py-24 px-4 text-center">
          <div className="bg-white dark:bg-[var(--surface)] p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
            <AlertTriangle size={36} className="text-amber-600 mx-auto" />
            <h2 className="text-lg font-bold text-navy dark:text-white">Order Access Error</h2>
            <p className="text-xs text-text-muted dark:text-slate-400">{error || 'The requested Purchase Order was not found.'}</p>
            <Link href="/dashboard" className="btn-amber text-xs px-6 py-2.5 rounded-xl font-bold inline-block">
              Return to Buyer Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate timeline steps
  const steps = [
    { label: 'PO Created', status: 'completed' },
    {
      label: 'Payment Secured',
      status: ['funds_secured', 'in_production', 'shipped', 'delivered', 'inspection_period', 'released'].includes(order.tradeAssuranceStatus)
        ? 'completed'
        : 'current',
    },
    {
      label: 'Goods Shipped',
      status: ['shipped', 'delivered', 'inspection_period', 'released'].includes(order.tradeAssuranceStatus)
        ? 'completed'
        : order.tradeAssuranceStatus === 'funds_secured' ? 'next' : 'upcoming',
    },
    {
      label: '7-Day Inspection',
      status: ['delivered', 'inspection_period', 'released'].includes(order.tradeAssuranceStatus)
        ? 'completed'
        : 'upcoming',
    },
    {
      label: 'Funds Released',
      status: order.tradeAssuranceStatus === 'released' ? 'completed' : 'upcoming',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans text-text-primary pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Breadcrumb & PO Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] text-text-muted font-medium mb-1">
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <ChevronRight size={10} />
              <span>Purchase Orders</span>
              <ChevronRight size={10} />
              <span className="text-navy font-bold">{order.poNumber}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-navy uppercase tracking-tight flex items-center gap-2">
              <span>PO #{order.poNumber}</span>
              {order.tradeAssuranceStatus === 'released' && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">Completed</span>
              )}
              {order.tradeAssuranceStatus === 'disputed' && (
                <span className="bg-red-100 text-red-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">Disputed</span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-right">
              <span className="text-[9px] uppercase font-bold text-text-muted block">Order Total</span>
              <span className="text-base font-black text-navy">
                ₹{(order.totalAmount / 100).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Aartha Protect Header Banner */}
        <div className="bg-gradient-to-r from-navy via-navy-light to-navy p-5 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="bg-amber-500/20 p-2.5 rounded-xl border border-amber-400/30 text-amber-400 mt-0.5">
              <Lock size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase text-amber-400">AARTHA PROTECT™</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-2 py-0.5 rounded font-bold border border-emerald-500/30">Powered by RBI-Authorized Payment Partner</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Payment processed securely via authorized payment partner and released to <strong>{order.supplierCompany}</strong> only upon delivery acceptance.
              </p>
            </div>
          </div>

          {order.tradeAssuranceStatus === 'awaiting_payment' && (
            <button
              onClick={handleSecurePayment}
              disabled={isProcessing}
              className="btn-amber text-xs font-extrabold px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <ShieldCheck size={16} />
              <span>Deposit ₹{(order.totalAmount / 100).toLocaleString('en-IN')} </span>
            </button>
          )}
        </div>

        {/* 5-Step Timeline Tracker */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">Aartha Protect Progress</span>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  step.status === 'completed'
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : step.status === 'current'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-400/30'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-extrabold uppercase">Step 0{idx + 1}</span>
                  {step.status === 'completed' && <CheckCircle size={13} className="text-emerald-600" />}
                  {step.status === 'current' && <Clock size={13} className="text-amber-600 animate-pulse" />}
                </div>
                <span className="text-[11px] font-bold leading-tight">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid: Order Specs & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Items & Shipping details */}
          <div className="md:col-span-2 space-y-6">
            {/* Items Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-navy">Order Specifications</span>
                <span className="text-[10px] text-text-muted font-medium">{order.items.length} line items</span>
              </div>
              <div className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-navy">{item.productName}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">{item.specification}</p>
                      <span className="text-[10px] font-semibold text-slate-500 mt-1 block">Qty: {item.quantity} units</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-navy">
                        ₹{(item.totalPrice / 100).toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[9px] text-text-muted">₹{(item.unitPrice / 100).toLocaleString('en-IN')} / unit</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logistics & Tracking Card */}
            {order.shippingDetails && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-navy" />
                    <span className="text-xs font-bold text-navy">Dispatch & Tracking Details</span>
                  </div>
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">In Transit</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div>
                    <span className="text-text-muted block text-[10px]">Carrier Partner</span>
                    <strong className="font-bold text-navy">{order.shippingDetails.carrier}</strong>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">AWB / Tracking LR No.</span>
                    <strong className="font-bold font-mono text-navy">{order.shippingDetails.trackingId}</strong>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">Shipped Date</span>
                    <span className="font-medium text-slate-700">{new Date(order.shippingDetails.shippedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">Est. Delivery</span>
                    <span className="font-medium text-slate-700">{order.shippingDetails.estimatedDelivery}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Panel depending on status */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <span className="text-xs font-bold text-navy block">Action Required</span>

              {order.tradeAssuranceStatus === 'awaiting_payment' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-text-muted">
                    Buyer deposit required to secure this Purchase Order. Payment protected through authorized payment partner until you inspect the delivered goods.
                  </p>
                  <button
                    onClick={handleSecurePayment}
                    disabled={isProcessing}
                    className="w-full btn-amber text-xs font-extrabold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock size={15} />
                    <span>Proceed to Secure Payment</span>
                  </button>
                </div>
              )}

              {order.tradeAssuranceStatus === 'funds_secured' && (
                <div className="space-y-3">
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-[11px] border border-emerald-200">
                    ✅ <strong>Payment Secured.</strong> Supplier has been instructed to start manufacturing.
                  </div>
                  <button
                    onClick={() => setShowShipModal(true)}
                    className="w-full bg-navy text-white text-xs font-extrabold py-3 rounded-xl hover:bg-navy-light transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Truck size={15} />
                    <span>[Supplier] Dispatch Order & Upload Tracking</span>
                  </button>
                </div>
              )}

              {order.tradeAssuranceStatus === 'shipped' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-text-muted">
                    Goods have been dispatched. When you receive the physical consignment, confirm delivery to start your 7-day inspection period.
                  </p>
                  <button
                    onClick={handleConfirmDelivery}
                    disabled={isProcessing}
                    className="w-full bg-navy text-white text-xs font-extrabold py-3 rounded-xl hover:bg-navy-light transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle size={15} />
                    <span>[Buyer] Confirm Goods Received</span>
                  </button>
                </div>
              )}

              {order.tradeAssuranceStatus === 'inspection_period' && (
                <div className="space-y-3">
                  <div className="bg-amber-50 text-amber-800 p-3 rounded-xl text-[11px] border border-amber-200">
                    ⏱️ <strong>7-Day Quality Inspection Active.</strong> Inspect specifications. If accepted, release funds to supplier.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleAcceptRelease}
                      disabled={isProcessing}
                      className="btn-amber text-xs font-extrabold py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle size={14} />
                      <span>Accept & Release Funds</span>
                    </button>

                    <button
                      onClick={() => setShowDisputeModal(true)}
                      className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle size={14} />
                      <span>Raise Dispute</span>
                    </button>
                  </div>
                </div>
              )}

              {order.tradeAssuranceStatus === 'released' && (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-[11px] border border-emerald-200 flex items-center gap-2">
                  <CheckCircle size={18} className="flex-shrink-0 text-emerald-600" />
                  <span>Aartha Protect milestone payment successfully completed and released to supplier bank account.</span>
                </div>
              )}

              {order.tradeAssuranceStatus === 'disputed' && (
                <div className="bg-red-50 text-red-800 p-4 rounded-xl text-[11px] border border-red-200 flex items-start gap-2.5">
                  <AlertCircle size={18} className="flex-shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <strong className="font-bold block">Settlement Blocked Under Dispute</strong>
                    <span>Aartha Protect resolution team is reviewing uploaded documents. Settlement will remain blocked until a mediated decision is finalized.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Financial Breakdown & Counterparty Info */}
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <span className="text-xs font-bold text-navy block border-b border-slate-100 pb-2">Financial Breakdown</span>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between text-text-muted">
                  <span>Goods Subtotal</span>
                  <span className="font-semibold text-navy">₹{(order.subtotalAmount / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span>Aartha Protection Fee (3%)</span>
                  <span className="font-semibold text-navy">₹{(order.platformFeeAmount / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex items-center justify-between font-extrabold text-navy text-xs">
                  <span>Total Payable</span>
                  <span className="text-amber-600">₹{(order.totalAmount / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Counterparty Cards */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <span className="text-xs font-bold text-navy block border-b border-slate-100 pb-2">Transaction Parties</span>

              <div className="space-y-3 text-[11px]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-muted block">Verified Buyer</span>
                  <strong className="text-navy font-bold">{order.buyerCompany}</strong>
                  <span className="block text-[10px] text-text-muted">{order.buyerEmail}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-text-muted block">GIDC Manufacturer</span>
                  <strong className="text-navy font-bold">{order.supplierCompany}</strong>
                  <span className="block text-[10px] text-emerald-700 font-semibold">✔ Verification Badge Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Supplier Ship Modal */}
      {showShipModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-navy uppercase">Upload Logistics & Tracking</h3>
            <form onSubmit={handleMarkShipped} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-navy uppercase mb-1">Carrier Partner</label>
                <input
                  type="text"
                  required
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy font-semibold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy uppercase mb-1">AWB / LR Tracking Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VRL-987654"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy font-bold focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowShipModal(false)}
                  className="w-1/2 bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-1/2 btn-amber text-xs font-extrabold py-2.5 rounded-xl shadow-md"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buyer Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-navy uppercase">Raise Quality / Specification Dispute</h3>
            <form onSubmit={handleRaiseDispute} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-navy uppercase mb-1">Dispute Reason</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-navy font-semibold focus:outline-none"
                >
                  <option value="Quality Defect">Quality Defect / Off-spec Material</option>
                  <option value="Quantity Mismatch">Quantity Mismatch</option>
                  <option value="Late Shipping">Excessive Shipping Delay</option>
                  <option value="Damaged Goods">Damaged Consignment</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-navy uppercase mb-1">Detailed Explanation</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the discrepancy observed during inspection..."
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-navy font-medium focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="w-1/2 bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-1/2 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold py-2.5 rounded-xl shadow-md"
                >
                  Submit Dispute for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
