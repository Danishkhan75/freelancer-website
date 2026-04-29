import { useState } from 'react'

interface PaymentCheckoutProps {
  planName: string
  amount: number
  packageType: 'starter' | 'professional' | 'enterprise'
  onClose: () => void
}

export default function PaymentCheckout({ planName, amount, packageType, onClose }: PaymentCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const initiatePayment = async () => {
    if (!formData.customerName || !formData.customerEmail) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Call the Razorpay payment edge function
      const response = await fetch('/api/razorpay-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          packageName: planName,
          packageType: packageType,
          amount: amount,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        alert('Failed to initiate payment')
        setLoading(false)
        return
      }

      // Load Razorpay checkout
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        const options = {
          key: data.key,
          amount: amount * 100, // Amount in paise
          currency: 'INR',
          order_id: data.razorpayOrderId,
          customer_id: data.orderId,
          name: 'Freelancer Services',
          description: `${planName} Package`,
          prefill: {
            name: formData.customerName,
            email: formData.customerEmail,
            contact: formData.customerPhone,
          },
          handler: function (response: any) {
            handlePaymentSuccess(response, data.orderId)
          },
          modal: {
            ondismiss: function () {
              setLoading(false)
            },
          },
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
      document.body.appendChild(script)
    } catch (error) {
      console.error('Payment error:', error)
      alert('Error initiating payment')
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (response: any, orderId: string) => {
    try {
      // Verify payment on backend
      const verifyResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        }),
      })

      const verifyData = await verifyResponse.json()

      if (verifyData.success) {
        alert('Payment successful! We will contact you shortly.')
        onClose()
      } else {
        alert('Payment verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      alert('Error verifying payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-2xl max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Checkout</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">Package</p>
          <p className="text-xl font-bold text-foreground">{planName}</p>
          <p className="text-2xl font-bold text-primary">₹{amount.toLocaleString('en-IN')}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Your full name"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="your@email.com"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="+91 XXXXX XXXXX"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>
        </div>

        <button
          onClick={initiatePayment}
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Pay ₹${amount.toLocaleString('en-IN')}`}
        </button>

        <p className="text-xs text-center text-muted-foreground">
          Powered by Razorpay. Your payment is secure and encrypted.
        </p>
      </div>
    </div>
  )
}
