import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { ReturnsForm } from './ReturnsForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Solicitar devolución',
  robots: { index: false, follow: false },
};

export default async function NewReturnPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id, isPaid: true, status: { in: ['DELIVERED', 'READY_FOR_PICKUP'] } },
    select: {
      id: true,
      receiptNumber: true,
      orderItems: { select: { id: true, productName: true, variantName: true, quantity: true, price: true } },
    },
  });
  if (!order) notFound();

  return <ReturnsForm order={{ ...order, orderItems: order.orderItems.map(item => ({ ...item, price: Number(item.price) })) }} />;
}
