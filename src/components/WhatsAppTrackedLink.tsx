'use client';
import { trackConversion } from '@/lib/analytics';
import { ReactNode, CSSProperties } from 'react';

interface WhatsAppTrackedLinkProps {
  href: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  eventSource: string;
  target?: string;
  rel?: string;
}

export default function WhatsAppTrackedLink({
  href,
  className,
  style,
  children,
  eventSource,
  target = '_blank',
  rel = 'noopener noreferrer',
}: WhatsAppTrackedLinkProps) {
  const handleClick = () => {
    trackConversion('whatsapp_click', eventSource);
  };

  return (
    <a
      href={href}
      className={className}
      style={style}
      target={target}
      rel={rel}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
