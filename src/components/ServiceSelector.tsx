import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface ServiceItem {
  title: string;
  description: string;
  benefits: string[];
  icon?: string;
  price?: string;
  deliveryTime?: string;
}

interface ServiceSelectorProps {
  services: ServiceItem[];
}

export default function ServiceSelector({ services }: ServiceSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = services[selectedIndex];

  return (
    <div className="space-y-8">
      {/* Service List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
              index === selectedIndex
                ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-background border-border hover:border-primary/50'
            }`}
          >
            <h3 className="font-semibold mb-2">{service.title}</h3>
            <p className={`text-sm ${index === selectedIndex ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {service.description.substring(0, 60)}...
            </p>
          </button>
        ))}
      </div>

      {/* Detailed Service View */}
      <div className="bg-card rounded-xl border border-border p-8 lg:p-12 space-y-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{selected.title}</h2>
          <p className="text-lg text-muted-foreground">{selected.description}</p>
        </div>

        {/* Key Details Grid */}
        {(selected.price || selected.deliveryTime) && (
          <div className="grid grid-cols-2 gap-6">
            {selected.price && (
              <div className="bg-muted rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-2">Starting Price</p>
                <p className="text-2xl font-bold text-primary">{selected.price}</p>
              </div>
            )}
            {selected.deliveryTime && (
              <div className="bg-muted rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-2">Typical Timeline</p>
                <p className="text-2xl font-bold text-primary">{selected.deliveryTime}</p>
              </div>
            )}
          </div>
        )}

        {/* Benefits */}
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-6">What's Included</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selected.benefits.map((benefit, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="flex-shrink-0">
                  <ChevronRight className="w-5 h-5 text-primary mt-0.5" />
                </div>
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-6 border-t border-border">
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            Get Started with {selected.title}
          </a>
        </div>
      </div>
    </div>
  );
}
