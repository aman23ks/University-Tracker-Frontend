"use client"

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, Check, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '../providers/AuthProvider';

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionDialog({ open, onOpenChange }: SubscriptionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { user, updateUser } = useAuth();

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/create-order`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      const orderData = await orderRes.json();
      console.log('Order created:', orderData); // Debug log
  
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }
  
      // Initialize Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Admit Bridge",
        description: "Premium Subscription",
        order_id: orderData.order_id, // Use order_id from response
        prefill: {
          email: user?.email
        },
        handler: async function(response: any) {
            console.log('Payment successful, response:', response); // Debug log
            try {
              // Make sure we have all required fields
              if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
                throw new Error('Missing payment verification data');
              }
          
              const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  payment_id: response.razorpay_payment_id,
                  order_id: response.razorpay_order_id,
                  signature: response.razorpay_signature
                })
              });
          
              console.log('Verification response status:', verifyRes.status); // Debug log
              const verifyData = await verifyRes.json();
              console.log('Verification response data:', verifyData); // Debug log
          
              if (!verifyRes.ok) {
                throw new Error(verifyData.error || 'Payment verification failed');
              }
          
              // Update user status
              if (user && updateUser) {
                updateUser({
                  ...user,
                  is_premium: true,
                  subscription: {
                    status: 'active',
                    expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                  }
                });
              }
          
              // Close dialog and show success message
              onOpenChange(false);
              toast({
                title: "Success",
                description: "Welcome to Premium! Enjoy unlimited access."
              });
          
            } catch (error: any) {
              console.error('Verification error:', error);
              toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Payment verification failed"
              });
            }
          },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        },
        theme: {
          color: "#4F46E5"
        }
      };
  
      const razorpay = new window.Razorpay(options);
      razorpay.open();
  
    } catch (error: any) {
      console.error('Payment error:', error); // Debug log
      setError(error.message || 'Failed to process payment');
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to initiate payment"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            Get unlimited access to all features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {[
              'Unlimited university selections',
              // 'Export data to Excel',
              'Custom data fields',
              'Priority support',
              'Advanced analytics'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-2">
            <p className="text-2xl font-bold">₹299/month</p>
            <p className="text-sm text-muted-foreground">
              Cancel anytime. No questions asked.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Upgrade Now'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}