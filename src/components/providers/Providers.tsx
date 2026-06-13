"use client";

import { SessionProvider } from "next-auth/react";
import { CartSyncProvider } from '@/components/providers/CartSyncProvider';

interface Props {
  children: React.ReactNode;
  session?: any;
}

export const Providers = ({ children, session }: Props) => {
  return (
    <SessionProvider session={session}>
      <CartSyncProvider>
        {children}
      </CartSyncProvider>
    </SessionProvider>
  );
};