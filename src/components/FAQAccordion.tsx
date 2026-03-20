'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './FAQAccordion.module.css';

interface FAQItem {
    q: string;
    a: string;
}

interface FAQAccordionProps {
    items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className={styles.accordion}>
            {items.map((item, index) => (
                <AccordionItem 
                    key={index} 
                    item={item} 
                    isOpen={activeIndex === index} 
                    onClick={() => toggleAccordion(index)}
                />
            ))}
        </div>
    );
}

function AccordionItem({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState('0px');

    useEffect(() => {
        if (isOpen) {
            setHeight(`${contentRef.current?.scrollHeight}px`);
        } else {
            setHeight('0px');
        }
    }, [isOpen]);

    return (
        <div className={`${styles.item} ${isOpen ? styles.open : ''}`}>
            <button 
                className={styles.question} 
                onClick={onClick}
                aria-expanded={isOpen}
            >
                <span className={styles.qText}>{item.q}</span>
                <span className={styles.icon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </span>
            </button>
            <div 
                className={styles.answerWrap} 
                style={{ height }}
            >
                <div ref={contentRef} className={styles.answer}>
                    <p>{item.a}</p>
                </div>
            </div>
        </div>
    );
}
