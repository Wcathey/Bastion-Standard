import AIAssistant from "@/components/Support/AIAssistant";
import ContactInformation from "@/components/Support/ContactInformation";
import ContactSupport from "@/components/Support/ContactSupport";
import FAQLink from "@/components/Support/FAQLink";
import SupportPageContainer from "@/components/Support/SupportPageContainer";
import SupportPageContent from "@/components/Support/SupportPageContent";
import SupportPageTitle from "@/components/Support/SupportPageTitle";

export default function SupportPage() {
  return (
    <SupportPageContainer>
      <SupportPageTitle />
      <SupportPageContent>
        <AIAssistant />
        <FAQLink />
        <ContactSupport />
        <ContactInformation />
      </SupportPageContent>
    </SupportPageContainer>
  );
}
