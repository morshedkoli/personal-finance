import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';

// GET /api/income/[id]
export async function GET(request, { params }) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const income = await prisma.income.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    return NextResponse.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 });
  }
}

// PATCH /api/income/[id]
export async function PATCH(request, { params }) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    const data = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if income belongs to user
    const income = await prisma.income.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData = {};
    
    if (data.amount !== undefined) updateData.amount = parseFloat(data.amount);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.date !== undefined) updateData.date = new Date(data.date);

    const updatedIncome = await prisma.income.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedIncome);
  } catch (error) {
    console.error('Error updating income:', error);
    return NextResponse.json({ error: 'Failed to update income' }, { status: 500 });
  }
}

// DELETE /api/income/[id]
export async function DELETE(request, { params }) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if income belongs to user
    const income = await prisma.income.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }

    await prisma.income.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting income:', error);
    return NextResponse.json({ error: 'Failed to delete income' }, { status: 500 });
  }
}