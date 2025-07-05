import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';

// GET /api/payables/[id]
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

    const payable = await prisma.payable.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!payable) {
      return NextResponse.json({ error: 'Payable not found' }, { status: 404 });
    }

    return NextResponse.json(payable);
  } catch (error) {
    console.error('Error fetching payable:', error);
    return NextResponse.json({ error: 'Failed to fetch payable' }, { status: 500 });
  }
}

// PATCH /api/payables/[id]
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

    // Check if payable belongs to user
    const payable = await prisma.payable.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!payable) {
      return NextResponse.json({ error: 'Payable not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.amount !== undefined) updateData.amount = parseFloat(data.amount);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.isPaid !== undefined) updateData.isPaid = data.isPaid;

    const updatedPayable = await prisma.payable.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedPayable);
  } catch (error) {
    console.error('Error updating payable:', error);
    return NextResponse.json({ error: 'Failed to update payable' }, { status: 500 });
  }
}

// DELETE /api/payables/[id]
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

    // Check if payable belongs to user
    const payable = await prisma.payable.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!payable) {
      return NextResponse.json({ error: 'Payable not found' }, { status: 404 });
    }

    await prisma.payable.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payable:', error);
    return NextResponse.json({ error: 'Failed to delete payable' }, { status: 500 });
  }
}