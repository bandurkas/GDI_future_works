'use client';
import { useMetaPixel } from '@/hooks/useMetaPixel';
import { ReactNode } from 'react';

interface WhatsAppTrackedLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  eventSource: string;
  target?: string;
  rel?: string;
}

export default function WhatsAppTrackedLink({
  href,
  className,
  children,
  eventSource,
  target = '_blank',
  rel = 'noopener noreferrer',
}: WhatsAppTrackedLinkProps) {
  const { trackLead } = useMetaPixel();

  const handleClick = () => {
    trackLead(eventSource);
  };

  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
