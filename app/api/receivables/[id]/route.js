import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';

// GET /api/receivables/[id]
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

    const receivable = await prisma.receivable.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!receivable) {
      return NextResponse.json({ error: 'Receivable not found' }, { status: 404 });
    }

    return NextResponse.json(receivable);
  } catch (error) {
    console.error('Error fetching receivable:', error);
    return NextResponse.json({ error: 'Failed to fetch receivable' }, { status: 500 });
  }
}

// PATCH /api/receivables/[id]
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

    // Check if receivable belongs to user
    const receivable = await prisma.receivable.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!receivable) {
      return NextResponse.json({ error: 'Receivable not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.amount !== undefined) updateData.amount = parseFloat(data.amount);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.isReceived !== undefined) updateData.isReceived = data.isReceived;

    const updatedReceivable = await prisma.receivable.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedReceivable);
  } catch (error) {
    console.error('Error updating receivable:', error);
    return NextResponse.json({ error: 'Failed to update receivable' }, { status: 500 });
  }
}

// DELETE /api/receivables/[id]
export async function DELETE(request, { params }) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fix: Properly destructure params after awaiting
    const id = params.id;
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if receivable belongs to user
    const receivable = await prisma.receivable.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!receivable) {
      return NextResponse.json({ error: 'Receivable not found' }, { status: 404 });
    }

    await prisma.receivable.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting receivable:', error);
    return NextResponse.json({ error: 'Failed to delete receivable' }, { status: 500 });
  }
}