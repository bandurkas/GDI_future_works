'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { KanbanCard } from '@/lib/crm-normalize';

type ManagementContextType = {
  isLeadDialogOpen: boolean;
  leadToEdit: KanbanCard | null;
  openAddLeadDialog: () => void;
  openEditLeadDialog: (card: KanbanCard) => void;
  closeLeadDialog: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
};

const ManagementContext = createContext<ManagementContextType | undefined>(undefined);

export function ManagementProvider({ children }: { children: ReactNode }) {
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<KanbanCard | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const openAddLeadDialog = () => {
    setLeadToEdit(null);
    setIsLeadDialogOpen(true);
  };

  const openEditLeadDialog = (card: KanbanCard) => {
    setLeadToEdit(card);
    setIsLeadDialogOpen(true);
  };

  const closeLeadDialog = () => {
    setIsLeadDialogOpen(false);
    setTimeout(() => setLeadToEdit(null), 300); // Wait for transition
  };

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <ManagementContext.Provider
      value={{
        isLeadDialogOpen,
        leadToEdit,
        openAddLeadDialog,
        openEditLeadDialog,
        closeLeadDialog,
        refreshKey,
        triggerRefresh
      }}
    >
      {children}
    </ManagementContext.Provider>
  );
}

export function useManagement() {
  const context = useContext(ManagementContext);
  if (context === undefined) {
    throw new Error('useManagement must be used within a ManagementProvider');
  }
  return context;
}
