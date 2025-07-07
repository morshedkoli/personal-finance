import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';

// GET /api/projects/[id] - Get a specific project
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      status,
      priority,
      startDate,
      endDate,
      budget,
      agentName,
      phoneNumber,
      cost,
      paidAmount,
      progress,
      incomeGenerated
    } = body;

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (budget !== undefined) updateData.budget = parseFloat(budget);
    if (agentName !== undefined) updateData.agentName = agentName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (cost !== undefined) updateData.cost = parseFloat(cost);
    if (paidAmount !== undefined) updateData.paidAmount = parseFloat(paidAmount);
    if (progress !== undefined) updateData.progress = parseInt(progress);
    if (incomeGenerated !== undefined) updateData.incomeGenerated = incomeGenerated;

    // Check if paidAmount is being updated to create payment history
    const isPaymentUpdate = paidAmount !== undefined && parseFloat(paidAmount) !== existingProject.paidAmount;
    
    let project;
    if (isPaymentUpdate) {
      // Use transaction to update project and create payment history atomically
      const result = await prisma.$transaction(async (tx) => {
        // Update the project
        const updatedProject = await tx.project.update({
          where: { id: id },
          data: updateData
        });

        // Calculate payment details
        const previousTotal = existingProject.paidAmount;
        const newTotal = parseFloat(paidAmount);
        const paymentAmount = newTotal - previousTotal;

        // Create payment history record
        await tx.paymentHistory.create({
          data: {
            amount: paymentAmount,
            previousTotal: previousTotal,
            newTotal: newTotal,
            description: `Payment update: ${existingProject.name}`,
            projectId: id,
            userId: user.id
          }
        });

        return updatedProject;
      });
      project = result;
    } else {
      // Regular update without payment history
      project = await prisma.project.update({
        where: { id: id },
        data: updateData
      });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}