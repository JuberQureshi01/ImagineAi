
import React from "react";
import { PricingTable } from "./PricingTable";

const PricingSection = () => {
  return (
    <section className="py-20" id="pricing">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            Simple{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Start free and upgrade when you need more power. No hidden fees,
            cancel anytime.
          </p>
        </div>
        
        <PricingTable />

      </div>
    </section>
  );
};

export default PricingSection;
