import { useState, useEffect } from 'react';
import { Coins, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface CreditTransaction {
  id: string;
  amount: number;
  type: 'deduction' | 'topup';
  description: string;
  timestamp: string;
}

export const CreditDisplay = () => {
  const [credits, setCredits] = useState<number>(500);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

  useEffect(() => {
    const storedCredits = localStorage.getItem('user-credits');
    const storedTransactions = localStorage.getItem('credit-transactions');
    
    if (storedCredits) setCredits(parseInt(storedCredits));
    if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
  }, []);

  const formatCredits = (amount: number) => `₹${amount}`;

  const getCreditColor = (amount: number) => {
    if (amount < 50) return 'text-destructive';
    if (amount < 150) return 'text-warning';
    return 'text-success';
  };

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
              <div className="max-h-32 overflow-y-auto space-y-2">
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
                Top-up functionality requires Supabase integration
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const useCredits = () => {
  const [credits, setCredits] = useState<number>(500);

  useEffect(() => {
    const stored = localStorage.getItem('user-credits');
    if (stored) setCredits(parseInt(stored));
  }, []);

  const deductCredits = (amount: number, description: string) => {
    const newCredits = Math.max(0, credits - amount);
    setCredits(newCredits);
    localStorage.setItem('user-credits', newCredits.toString());

    // Add transaction record
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

    return newCredits;
  };

  const hasCredits = (amount: number) => credits >= amount;

  return { credits, deductCredits, hasCredits };
};