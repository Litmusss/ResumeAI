'use client';

import Questionnaire from '@/components/layout/Questionnaire';
import PageWrapper from '@/components/common/PageWrapper';
import Header from '@/components/layout/Header'; 

export default function QuestionnairePage() {
  return (
    <PageWrapper>   
      <Header /> {/* Add the navigation bar */}
      <div className="page-container">
        <h1 className="page-title"></h1>
        <Questionnaire />
      </div>
    </PageWrapper>
  );
}
