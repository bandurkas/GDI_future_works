"use client";
import dynamic from 'next/dynamic';
const GoogleOneTapPopup = dynamic(() => import('./GoogleOneTapPopup'), { ssr: false });
export default function LazyOneTap() {
  return <GoogleOneTapPopup />;
}
