// components/providers/SubscriptionChecker.tsx
"use client"

import { useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// export function SubscriptionChecker() {
//   useEffect(() => {
//     const checkSubscription = async () => {
//       const token = localStorage.getItem('token');
//       if (!token) return;

//       try {
//         const response = await fetch(`${API_URL}/api/subscription/status`, {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });

//         if (response.ok) {
//           const data = await response.json();
//           // Update local storage with latest subscription status
//           const user = JSON.parse(localStorage.getItem('user') || '{}');
//           user.is_premium = data.is_premium;
//           user.subscription = data.subscription;
//           localStorage.setItem('user', JSON.stringify(user));
//         }
//       } catch (error) {
//         console.error('Failed to check subscription:', error);
//       }
//     };

//     // Check subscription status every minute
//     const interval = setInterval(checkSubscription, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   return null;
// }

// Subscription: Remove the code below and uncomment the code above
export function SubscriptionChecker() {
  useEffect(() => {
    // Comment out or modify the subscription checker to maintain premium status
    /*
    const checkSubscription = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/subscription/status`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Update local storage with latest subscription status
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          
          // Override to keep premium active
          data.is_premium = true;
          if (data.subscription) {
            data.subscription.status = 'active';
          }
          
          user.is_premium = data.is_premium;
          user.subscription = data.subscription;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        console.error('Failed to check subscription:', error);
      }
    };

    // Check subscription status every minute
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
    */
    
    // For now, we'll do nothing to maintain premium for all users
  }, []);

  return null;
}