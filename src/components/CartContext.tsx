'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course } from '@/data/courses';

export interface CartItem {
  courseId: string;
  courseTitle: string;
  slug: string;
  dateId: string;
  dateLabel: string;
  timeLabel: string;
  priceIDR: number;
  priceMYR: number;
  icon: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (courseId: string, dateId: string) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('gdi_cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('gdi_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    // Check if duplicate (same course + same date)
    const exists = items.find(i => i.courseId === item.courseId && i.dateId === item.dateId);
    if (!exists) {
      setItems(prev => [...prev, item]);
    }
  };

  const removeItem = (courseId: string, dateId: string) => {
    setItems(prev => prev.filter(i => !(i.courseId === courseId && i.dateId === dateId)));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems: items.length }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
