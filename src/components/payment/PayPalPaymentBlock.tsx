'use client';
import { useEffect, useRef } from 'react';
import styles from './PayPalPaymentBlock.module.css';

const PAYPAL_SDK_URL =
  'https://www.paypal.com/sdk/js?client-id=BAAw73WfplCBRSl5lZN5DokZVGoa3H5xmx3sqc0WOPKwR1oU3KfNfFOXKf49lSCiUtnRvI51DjVRi2b4Tc&components=hosted-buttons&disable-funding=venmo&currency=USD';

const PAYPAL_HOSTED_BUTTON_ID = 'V3RUE3TLKDRRQ';
const CONTAINER_ID = `paypal-button-container-${PAYPAL_HOSTED_BUTTON_ID}`;

declare global {
  interface Window { paypal?: any; }
}

export default function PayPalPaymentBlock() {
  const rendered = useRef(false);

  useEffect(() => {
    if (rendered.current) return;

    const render = () => {
      if (rendered.current) return;
      const container = document.getElementById(CONTAINER_ID);
      if (!container || !window.paypal?.HostedButtons) return;
      rendered.current = true;
      window.paypal.HostedButtons({ hostedButtonId: PAYPAL_HOSTED_BUTTON_ID })
        .render(`#${CONTAINER_ID}`);
    };

    // If SDK already on page (e.g. navigated back), render immediately
    if (window.paypal?.HostedButtons) {
      render();
      return;
    }

    // Otherwise inject script dynamically
    const existing = document.getElementById('paypal-sdk');
    if (existing) {
      // Script tag exists but SDK not ready yet — wait for it
      existing.addEventListener('load', render);
      return () => existing.removeEventListener('load', render);
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = PAYPAL_SDK_URL;
    script.async = true;
    script.onload = render;
    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount — PayPal SDK is global and re-adding
      // it causes "window.paypal already defined" errors
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.trustRow}>
        <span className={styles.trustBadge}>🔒 Secure</span>
        <span className={styles.trustBadge}>💳 Card or PayPal</span>
        <span className={styles.trustBadge}>✅ Auto-confirmed</span>
      </div>
      <p className={styles.note}>
        Complete your payment securely via PayPal.
        Your enrollment is confirmed automatically after payment.
      </p>
      <div id={CONTAINER_ID} className={styles.container} />
      <p className={styles.currency}>Payment processed in USD via PayPal</p>
    </div>
  );
}
