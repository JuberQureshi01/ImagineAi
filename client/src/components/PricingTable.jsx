
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, Crown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";

const RAZORPAY_KEY_ID = "rzp_test_C8tZc99XrKiOA4";

const PlanFeature = ({ children, included }) => (
  <li className="flex items-center gap-3">
    {included ? (
      <Check className="h-5 w-5 text-cyan-400 flex-shrink-0" />
    ) : (
      <X className="h-5 w-5 text-white/40 flex-shrink-0" />
    )}
    <span className={included ? 'text-white' : 'text-white/50'}>{children}</span>
  </li>
);

export const PricingTable = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPro = user?.plan === 'pro';

  const handleUpgradeClick = async () => {
    if (!user) {
      toast.error("Please log in or create an account to upgrade.");
      navigate("/register");
      return;
    }
    const toastId = toast.loading("Initializing secure payment...");
    try {
      const orderResponse = await api.post("/api/payment/order");
      const order = orderResponse.data;
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "ImagineAi",
        description: "Monthly Pro Membership",
        image: "/logo-text.png",
        order_id: order.id,
        handler: async function (response) {
          const verificationToast = toast.loading("Verifying payment...");
          try {
            const verificationResponse = await api.post("/api/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            const updatedUser = verificationResponse.data.user;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            toast.success(verificationResponse.data.msg, { id: verificationToast });
            setTimeout(() => window.location.reload(), 1500);
          } catch (err) {
            toast.error("Payment verification failed. Please contact support.", { id: verificationToast });
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#06b6d4", backdrop_color: "rgba(15, 23, 42, 0.8)" },
        modal: { ondismiss: () => toast.info("Payment was cancelled."), backdropclose: true },
        magic: true,
      };
      toast.dismiss(toastId);
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Could not start payment. Please try again.", { id: toastId });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
      {/* Free Plan */}
      <div className={`border rounded-xl p-6 flex flex-col ${isPro ? 'border-white/20' : 'border-2 border-cyan-400'}`}>
        <h3 className="text-2xl font-semibold">Free</h3>
        <p className="text-white/70 mb-6">For individuals starting out</p>
        <p className="text-4xl font-bold mb-6">$0<span className="text-xl font-normal text-white/70">/month</span></p>
        <ul className="space-y-4 flex-grow">
          <PlanFeature included={true}>3 Projects</PlanFeature>
          <PlanFeature included={true}>20 Exports per month</PlanFeature>
          <PlanFeature included={true}>Basic Editing Tools</PlanFeature>
          <PlanFeature included={false}>AI Background Removal</PlanFeature>
          <PlanFeature included={false}>AI Image Extender</PlanFeature>
          <PlanFeature included={false}>AI Generative Fill</PlanFeature>
        </ul>
        <Button variant="outline" disabled={!isPro} className="w-full mt-8">
          {isPro ? "Free Plan" : "Your Current Plan"}
        </Button>
      </div>

      {/* Pro Plan */}
      <div className={`border rounded-xl p-6 flex flex-col relative overflow-hidden ${isPro ? 'border-2 border-cyan-400' : 'border-white/20'}`}>
        <div className="absolute top-0 right-0 bg-cyan-400 text-slate-900 px-3 py-1 text-sm font-bold" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 15% 50%)' }}>
          BEST VALUE
        </div>
        <h3 className="text-2xl font-semibold flex items-center gap-2">Pro <Crown className="h-5 w-5 text-yellow-400" /></h3>
        <p className="text-white/70 mb-6">For professionals and power users</p>
        <p className="text-4xl font-bold mb-6">₹1200<span className="text-xl font-normal text-white/70">/month</span></p>
        <ul className="space-y-4 flex-grow">
          <PlanFeature included={true}>Unlimited Projects</PlanFeature>
          <PlanFeature included={true}>Unlimited Exports</PlanFeature>
          <PlanFeature included={true}>Basic Editing Tools</PlanFeature>
          <PlanFeature included={true}>AI Background Removal</PlanFeature>
          <PlanFeature included={true}>AI Image Extender</PlanFeature>
          <PlanFeature included={true}>AI Generative Fill</PlanFeature>
        </ul>
        <Button variant="primary" onClick={handleUpgradeClick} disabled={isPro} className="w-full mt-8">
          {isPro ? "Your Current Plan" : "Upgrade to Pro"}
        </Button>
      </div>
    </div>
  );
};
