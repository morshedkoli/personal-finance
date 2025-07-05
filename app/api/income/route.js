import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';

// GET /api/income
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

    const incomes = await prisma.income.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(incomes);
  } catch (error) {
    console.error('Error fetching income:', error);
    return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 });
  }
}

// POST /api/income
export async function POST(request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { amount, description, category, date } = await request.json();

    if (!amount || !description || !category || !date) {
      return NextResponse.json({ error: 'Amount, description, category, and date are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const income = await prisma.income.create({
      data: {
        amount: parseFloat(amount),
        description,
        category,
        date: new Date(date),
        userId: user.id,
      },
    });

    return NextResponse.json(income);
  } catch (error) {
    console.error('Error creating income:', error);
    return NextResponse.json({ error: 'Failed to create income' }, { status: 500 });
  }
}