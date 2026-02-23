// app/ats-checker/page.tsx
import PageWrapper from "@/components/common/PageWrapper";
import ATSChecker from "@/components/layout/Atschecker";
import Header from '@/components/layout/Header'; 


export default function ATSCheckerPage() {
  return (
    <PageWrapper>
      <Header /> {/* Add the navigation bar */}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <ATSChecker />
      </div>
    </PageWrapper>
  );
}