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

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  phoneVerified?: boolean;
}

interface CartContextType {
  items: CartItem[];
  customerInfo: CustomerInfo;
  addItem: (item: CartItem) => void;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  removeItem: (courseId: string, dateId: string) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: ''
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('gdi_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }

    const savedInfo = localStorage.getItem('gdi_customer_info');
    if (savedInfo) {
      try {
        setCustomerInfo(JSON.parse(savedInfo));
      } catch (e) {
        console.error('Failed to parse customer info', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('gdi_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('gdi_customer_info', JSON.stringify(customerInfo));
  }, [customerInfo]);

  const addItem = (item: CartItem) => {
    // Check if duplicate (same course + same date)
    const exists = items.find(i => i.courseId === item.courseId && i.dateId === item.dateId);
    if (!exists) {
      setItems(prev => [...prev, item]);
    }
  };

  const updateCustomerInfo = (info: Partial<CustomerInfo>) => {
    setCustomerInfo(prev => ({ ...prev, ...info }));
  };

  const removeItem = (courseId: string, dateId: string) => {
    setItems(prev => prev.filter(i => !(i.courseId === courseId && i.dateId === dateId)));
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, customerInfo, addItem, updateCustomerInfo, removeItem, clearCart, totalItems: items.length }}>
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
