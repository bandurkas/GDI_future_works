import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import HeroSection from './_sections/HeroSection';
import EarningsSection from './_sections/EarningsSection';
import WhyTeachSection from './_sections/WhyTeachSection';
import TopicsSection from './_sections/TopicsSection';
import HowItWorksSection from './_sections/HowItWorksSection';
import FinalCtaSection from './_sections/FinalCtaSection';

export const metadata: Metadata = {
  title: 'Become a Tutor — GDI FutureWorks',
  description: 'Teach what you know. Set your schedule. Earn flexible income online with GDI FutureWorks — the platform that handles marketing, payments, and students for you.',
};

// Calculator is a client component with interactive sliders
const IncomeCalculator = dynamic(() => import('./_sections/IncomeCalculator'));

export default function ForTutorsPage() {
  return (
    <div className={styles.page}>
      <HeroSection />
      <EarningsSection />
      <IncomeCalculator />
      <WhyTeachSection />
      <TopicsSection />
      <HowItWorksSection />
      <FinalCtaSection />
    </div>
  );
}
