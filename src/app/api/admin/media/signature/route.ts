import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { auth } from '@/auth';
import { canAccessEcommerceAdmin } from '@/lib/permissions';
import { getEcommerceContextFromCookie } from '@/lib/ecommerce-context';

export async function GET() {
  const session = await auth();
  if (!session?.user || !canAccessEcommerceAdmin(session.user)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return NextResponse.json({ error: 'Cloudinary no está configurado en el servidor' }, { status: 503 });
  const { business, activeBranch } = await getEcommerceContextFromCookie();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `festamas/${business.id}/${activeBranch.id}`;
  const signature = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest('hex');
  return NextResponse.json({ cloudName, apiKey, timestamp, folder, signature });
}
