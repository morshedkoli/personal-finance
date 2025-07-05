import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';

// GET /api/receivables
export async function GET(request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const receivables = await prisma.receivable.findMany({
      where: { userId: user.id },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(receivables);
  } catch (error) {
    console.error('Error fetching receivables:', error);
    return NextResponse.json({ error: 'Failed to fetch receivables' }, { status: 500 });
  }
}

// POST /api/receivables
export async function POST(request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, amount, description, dueDate } = await request.json();

    if (!name || !amount || !description || !dueDate) {
      return NextResponse.json({ error: 'Name, amount, description, and dueDate are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const receivable = await prisma.receivable.create({
      data: {
        name,
        amount: parseFloat(amount),
        description,
        dueDate: new Date(dueDate),
        userId: user.id,
      },
    });

    return NextResponse.json(receivable);
  } catch (error) {
    console.error('Error creating receivable:', error);
    return NextResponse.json({ error: 'Failed to create receivable' }, { status: 500 });
  }
}