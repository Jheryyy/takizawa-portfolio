'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ProjectCategory } from '@/types/portfolio';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { FooterSection } from '@/components/sections/FooterSection';
import { Toast } from '@/components/ui/Toast';
import ScrollStack, { ScrollStackItem } from '@/components/ui/ScrollStack';

const CrossedScrollVelocity = dynamic(
  () => import('@/components/sections/CrossedScrollVelocity').then((mod) => mod.CrossedScrollVelocity),
  {
    loading: () => <div className="min-h-[170px]" />,
    ssr: false,
  }
);

const GuestbookSection = dynamic(
  () => import('@/components/sections/GuestbookSection').then((mod) => mod.GuestbookSection),
  {
    loading: () => <div className="min-h-[300px]" />,
    ssr: false,
  }
);

const ContactSection = dynamic(
  () => import('@/components/sections/ContactSection').then((mod) => mod.ContactSection),
  {
    loading: () => <div className="min-h-[400px]" />,
    ssr: false,
  }
);

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'All'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-canvas text-neutral-900 dark:text-white overflow-x-clip">
      {/* ScrollStack exclusively for Home to About transition */}
      <ScrollStack
        useWindowScroll={true}
        itemDistance={60}
        itemStackDistance={0}
        stackPosition="14%"
        itemScale={0}
        baseScale={1}
        dimAmount={0.25}
        blurAmount={0}
        tiltAmount={0}
        rotationAmount={0}
        smoothScroll={false}
        snap={false}
        holdDistance={120}
        className="w-full"
      >
        <ScrollStackItem
          itemClassName="w-full bg-transparent border-none rounded-none !p-0"
          style={{ boxShadow: 'none' }}
        >
          <HeroSection onSelectCategory={setSelectedCategory} />
        </ScrollStackItem>

        <ScrollStackItem
          itemClassName="w-full bg-canvas rounded-t-[36px] sm:rounded-t-[44px] border-t border-hairline shadow-[0_-24px_60px_rgba(0,0,0,0.25)] dark:shadow-[0_-24px_60px_rgba(0,0,0,0.7)] !p-0 pt-20 sm:pt-28 lg:pt-36 pb-0"
        >
          <AboutSection />
        </ScrollStackItem>
      </ScrollStack>

      {/* Projects Section - Full width with pinned horizontal scroll */}
      <main className="w-full">
        <ProjectsSection
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </main>

      {/* Crossed Kinetic Ribbons: Directly beneath Projects */}
      <CrossedScrollVelocity />

      {/* Guestbook / Threads Section - Pinned scroll until threads finish, then to Contacts */}
      <div className="w-full">
        <GuestbookSection onNotifyToast={showToast} />
      </div>

      {/* Contact Section: Directly beneath Guestbook */}
      <div className="w-full px-4 sm:px-8 lg:px-12 pb-28 sm:pb-36">
        <ContactSection onNotifyToast={showToast} />
      </div>

      {/* Footer */}
      <FooterSection onNotifyToast={showToast} />

      {/* Global Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
}
