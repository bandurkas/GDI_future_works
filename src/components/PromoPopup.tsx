'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, Calendar, Clock, Award, Video, CheckCircle2 } from 'lucide-react';
import s from './PromoPopup.module.css';

const PROMO_STORAGE_KEY = 'gdi_hide_promo_python_apr24';
const POPUP_DELAY_MS = 10000; // 10 seconds

export default function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const checkAndOpen = useCallback(() => {
    if (hasTriggered) return;
    
    // Check if user has already dismissed it
    const isHidden = localStorage.getItem(PROMO_STORAGE_KEY);
    if (!isHidden) {
      setIsOpen(true);
      setHasTriggered(true);
    }
  }, [hasTriggered]);

  useEffect(() => {
    // Strategy 1: Time Delay (10 seconds)
    const timeoutId = setTimeout(() => {
      checkAndOpen();
    }, POPUP_DELAY_MS);

    // Strategy 2: Exit Intent (Mouse leaves top of viewport)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        checkAndOpen();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [checkAndOpen]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    // REMEMBER they closed it, don't show again
    localStorage.setItem(PROMO_STORAGE_KEY, 'true');
  };

  const handleEnrollClick = () => {
    handleClose();
    // Use the provided WhatsApp link
    const waLink = "https://wa.me/628211704707?text=" + encodeURIComponent("Hello GDI! I want to enroll in the Python 2-Day Mini Course.");
    window.open(waLink, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className={s.overlay} onClick={handleClose}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>
        <button className={s.closeButton} onClick={handleClose} aria-label="Close dialog">
          <X size={20} />
        </button>

        <div className={s.imageArea}>
          <Image 
            src="/assets/banners/python-promo.jpg" 
            alt="Python 2-Day Mini Course Intensive & Practical" 
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={90}
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>

        <div className={s.contentArea}>
          <span className={s.badge}>Limited Spots</span>
          
          <h2 className={s.title}>
            Learn Python in <br />
            <span className={s.titleHighlight}>2 Days</span>
          </h2>
          
          <p className={s.description}>
            Pelajari Python secara langsung dari mentor profesional hanya dalam 2 hari. Bangun dasar pemrograman yang kuat dengan kurikulum standar industri.
          </p>

          <ul className={s.bullets}>
            <li>
              <span className={s.bulletIcon}><Calendar size={18} /></span>
              24 - 25 April
            </li>
            <li>
              <span className={s.bulletIcon}><Clock size={18} /></span>
              2 Jam / Hari
            </li>
            <li>
              <span className={s.bulletIcon}><Video size={18} /></span>
              Kelas Online Interaktif
            </li>
            <li>
              <span className={s.bulletIcon}><Award size={18} /></span>
              Sertifikat + Mentor Profesional
            </li>
          </ul>

          <button onClick={handleEnrollClick} className={s.enrollButton}>
            ENROLL NOW - IDR 400.000 <CheckCircle2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
