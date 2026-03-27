"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import CheckoutLoading from "@/components/Checkout/CheckoutLoading";
import CheckoutPageContainer from "@/components/Checkout/CheckoutPageContainer";
import NextSteps from "@/components/Checkout/NextSteps";
import OrderReference from "@/components/Checkout/OrderReference";
import SuccessActions from "@/components/Checkout/SuccessActions";
import SuccessIcon from "@/components/Checkout/SuccessIcon";
import SuccessMessage from "@/components/Checkout/SuccessMessage";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      router.push("/");
      return;
    }

    // Clear the cart after successful checkout
    clearCart();

    // Optional: Fetch session details from your API
    setLoading(false);
  }, [sessionId, router, clearCart]);

  if (loading) {
    return <CheckoutLoading message="Processing your order..." />;
  }

  return (
    <CheckoutPageContainer>
      <div className="text-center">
        <SuccessIcon />
        <SuccessMessage />
        <OrderReference sessionId={sessionId} />
        <NextSteps />
        <SuccessActions />
      </div>
    </CheckoutPageContainer>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
