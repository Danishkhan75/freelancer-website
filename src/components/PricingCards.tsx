import { useState } from 'react'
import PaymentCheckout from './PaymentCheckout'

interface PlanProps {
  name: string
  description: string
  price: string
  priceOriginal: string
  duration: string
  features: string[]
  cta: string
  highlight: boolean
  amount: number
  packageType: 'starter' | 'professional' | 'enterprise'
}

interface PricingCardsProps {
  plans: PlanProps[]
}

export default function PricingCards({ plans }: PricingCardsProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanProps | null>(null)

  const handlePlanSelect = (plan: PlanProps) => {
    if (plan.packageType === 'enterprise') {
      // For enterprise, redirect to contact
      window.location.href = '/contact'
    } else {
      setSelectedPlan(plan)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-xl border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl ${
              plan.highlight
                ? 'border-primary bg-primary/5 shadow-lg md:scale-105'
                : 'border-border bg-card'
            }`}
          >
            {plan.highlight && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-2 text-sm font-bold rounded-bl-lg">
                POPULAR
              </div>
            )}

            <div className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">{plan.price}</div>
                <p className="text-sm text-muted-foreground">{plan.priceOriginal} (approx.) • {plan.duration}</p>
              </div>

              <button
                onClick={() => handlePlanSelect(plan)}
                className={`w-full py-3 font-semibold rounded-lg transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5'
                    : 'border-2 border-primary text-primary hover:bg-primary/5'
                }`}
              >
                {plan.cta}
              </button>

              <div className="space-y-3 pt-6 border-t border-border">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <PaymentCheckout
          planName={selectedPlan.name}
          amount={selectedPlan.amount}
          packageType={selectedPlan.packageType}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </>
  )
}
