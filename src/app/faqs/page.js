import FAQContent from "@/components/Faq/FAQContent";
import FAQNeedHelp from "@/components/Faq/FAQNeedHelp";
import FAQPageContainer from "@/components/Faq/FAQPageContainer";
import FAQPageTitle from "@/components/Faq/FAQPageTitle";

export default function FAQsPage() {
  return (
    <FAQPageContainer>
      <FAQPageTitle />
      <FAQContent />
      <FAQNeedHelp />
    </FAQPageContainer>
  );
}
