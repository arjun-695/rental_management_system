"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Extend window object to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayButtonProps {
  bookingId: string;
}

export default function RazorpayButton({ bookingId }: RazorpayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsLoading(false);
        return;
      }

      // Step 1: Create Order on Backend
      const orderResponse = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.ok) {
        alert(orderData.error || "Failed to create order");
        setIsLoading(false);
        return;
      }

      // Step 2: Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: "INR",
        name: "RentEase",
        description: "Property Rental Payment",
        order_id: orderData.data.orderId,
        handler: async function (response: any) {
          // Step 3: Verify Signature on Backend
          const verifyResponse = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            }),
          });
          const verifyData = await verifyResponse.json();
          if (verifyData.ok) {
            alert("Payment Verified! Thank You.");
            router.refresh();
          } else {
            alert("Payment Verification Failed!");
          }
        },
        prefill: {
          name: "Tenant Sandbox",
          email: "tenant@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#4f46e5", // Indigo-600
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on('payment.failed', function (response: any){
        alert(response.error.description);
      });

    } catch (error) {
      console.error(error);
      alert("An error occurred during payment processing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Processing...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" /> Pay Now
        </>
      )}
    </button>
  );
}
