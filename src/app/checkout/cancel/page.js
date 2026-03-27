import CancelActions from "@/components/Checkout/CancelActions";
import CancelHelp from "@/components/Checkout/CancelHelp";
import CancelIcon from "@/components/Checkout/CancelIcon";
import CancelMessage from "@/components/Checkout/CancelMessage";
import CartSavedInfo from "@/components/Checkout/CartSavedInfo";
import CheckoutPageContainer from "@/components/Checkout/CheckoutPageContainer";

export default function CheckoutCancel() {
  return (
    <CheckoutPageContainer>
      <div className="text-center">
        <CancelIcon />
        <CancelMessage />
        <CartSavedInfo />
        <CancelHelp />
        <CancelActions />
      </div>
    </CheckoutPageContainer>
  );
}
