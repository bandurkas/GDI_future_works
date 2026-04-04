'use client';
import Script from 'next/script';
import { useEffect, useRef } from 'react';
import styles from './PayPalPaymentBlock.module.css';

const PAYPAL_HOSTED_BUTTON_ID = 'V3RUE3TLKDRRQ';
const PAYPAL_BUTTON_CONTAINER_ID = `paypal-button-container-${PAYPAL_HOSTED_BUTTON_ID}`;

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PayPalPaymentBlock() {
  const rendered = useRef(false);

  const renderButton = () => {
    if (rendered.current) return;
    if (typeof window === 'undefined' || !window.paypal?.HostedButtons) return;
    const container = document.getElementById(PAYPAL_BUTTON_CONTAINER_ID);
    if (!container) return;
    rendered.current = true;
    window.paypal.HostedButtons({
      hostedButtonId: PAYPAL_HOSTED_BUTTON_ID,
    }).render(`#${PAYPAL_BUTTON_CONTAINER_ID}`);
  };

  useEffect(() => {
    // In case script already loaded (e.g. hot reload)
    if (window.paypal?.HostedButtons) {
      renderButton();
    }
  });

  return (
    <>
      <Script
        src="https://www.paypal.com/sdk/js?client-id=BAAw73WfplCBRSl5lZN5DokZVGoa3H5xmx3sqc0WOPKwR1oU3KfNfFOXKf49lSCiUtnRvI51DjVRi2b4Tc&components=hosted-buttons&disable-funding=venmo&currency=USD"
        onLoad={renderButton}
        strategy="afterInteractive"
      />
      <div className={styles.wrapper}>
        <div className={styles.trustRow}>
          <span className={styles.trustBadge}>🔒 Secure</span>
          <span className={styles.trustBadge}>💳 Card or PayPal</span>
          <span className={styles.trustBadge}>✅ Auto-confirmed</span>
        </div>
        <p className={styles.note}>
          You will be redirected to PayPal to complete payment securely.
          Your enrollment is confirmed automatically after payment.
        </p>
        <div id={PAYPAL_BUTTON_CONTAINER_ID} className={styles.container} />
        <p className={styles.currency}>Payment processed in USD via PayPal</p>
      </div>
    </>
  );
}
