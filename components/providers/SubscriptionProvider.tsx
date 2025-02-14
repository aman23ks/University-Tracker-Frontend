"use client"

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthProvider';
import { SubscriptionDialog } from '../ui/SubscriptionDialog';

interface SubscriptionContextType {
  showUpgradeDialog: () => void;
  hideUpgradeDialog: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const showUpgradeDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const hideUpgradeDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        showUpgradeDialog,
        hideUpgradeDialog
      }}
    >
      {children}
      <SubscriptionDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}