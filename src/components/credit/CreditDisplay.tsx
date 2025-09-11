"use client";

import { useState, useEffect } from 'react';
import { Coins, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getUserCredits, deductCredits } from '@/app/actions/credits';
import { toast } from 'sonner';

interface CreditTransaction {
  id: string;
  amount: number;
  type: 'deduction' | 'topup';
  description: string;
  timestamp: string;
}

export const CreditDisplay = () => {
  const { credits, loading } = useCreditsWithRefresh();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

  // Load transactions from localStorage
  useEffect(() => {
    const storedTransactions = localStorage.getItem('credit-transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
  }, []);

  const formatCredits = (amount: number) => `₹${amount}`;

  const getCreditColor = (amount: number) => {
    if (amount < 50) return 'text-destructive';
    if (amount < 150) return 'text-warning';
    return 'text-success';
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Coins className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Coins className="w-4 h-4 text-primary" />
        <span className={`font-medium ${getCreditColor(credits)}`}>
          {formatCredits(credits)} available
        </span>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="w-3 h-3 mr-1" />
            Credits
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Credit Management</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {formatCredits(credits)}
                  </div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h4 className="font-medium">Recent Transactions</h4>
              <div className="max-h-36 overflow-y-auto space-y-2 custom-scrollbar">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{transaction.description}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={transaction.type === 'deduction' ? 'destructive' : 'default'}>
                        {transaction.type === 'deduction' ? '-' : '+'}₹{transaction.amount}
                      </Badge>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No transactions yet
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Top-up Options</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" disabled>₹100</Button>
                <Button variant="outline" disabled>₹250</Button>
                <Button variant="outline" disabled>₹500</Button>
                <Button variant="outline" disabled>₹1000</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Top-up functionality requires payment integration
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const useCredits = () => {
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      const userCredits = await getUserCredits();
      setCredits(userCredits);
    } catch (error) {
      console.error('Failed to load credits:', error);
      // Fallback to localStorage if database fails
      const stored = localStorage.getItem('user-credits');
      if (stored) setCredits(parseInt(stored));
    } finally {
      setLoading(false);
    }
  };

  const deductCreditsLocal = async (amount: number, description: string = 'Image generation') => {
    try {
      const result = await deductCredits(amount);

      if (result.success) {
        setCredits(result.newCredits);

        // Add transaction record to localStorage for UI display
        const transactions = JSON.parse(localStorage.getItem('credit-transactions') || '[]');
        const newTransaction: CreditTransaction = {
          id: Date.now().toString(),
          amount,
          type: 'deduction',
          description,
          timestamp: new Date().toISOString()
        };
        transactions.unshift(newTransaction);
        localStorage.setItem('credit-transactions', JSON.stringify(transactions.slice(0, 50)));

        return result.newCredits;
      } else {
        toast.error(result.message);
        return credits;
      }
    } catch (error) {
      console.error('Failed to deduct credits:', error);
      toast.error('Failed to deduct credits');
      return credits;
    }
  };

  const hasCredits = (amount: number) => credits >= amount;

  return { credits, loading, deductCredits: deductCreditsLocal, hasCredits, loadCredits };
};

// Global credit refresh mechanism
let creditRefreshCallbacks: (() => void)[] = [];

export const refreshAllCredits = () => {
  creditRefreshCallbacks.forEach(callback => callback());
};

export const useCreditsWithRefresh = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const creditsHook = useCredits();

  useEffect(() => {
    const refreshCallback = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    creditRefreshCallbacks.push(refreshCallback);

    return () => {
      creditRefreshCallbacks = creditRefreshCallbacks.filter(cb => cb !== refreshCallback);
    };
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      creditsHook.loadCredits();
    }
  }, [refreshTrigger, creditsHook]);

  return creditsHook;
};
