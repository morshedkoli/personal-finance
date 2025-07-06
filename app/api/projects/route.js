import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';

// GET /api/projects - Get all projects for the authenticated user
export async function GET(request) {
  try {
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

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request) {
  try {
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
      status,
      priority,
      startDate,
      endDate,
      budget,
      agentName,
      phoneNumber,
      cost,
      paidAmount = 0,
      progress = 0
    } = body;

    // Validate required fields
    if (!name || !description || !status || !priority || !startDate || !endDate || !budget) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        details: 'Name, description, status, priority, start date, end date, and budget are required' 
      }, { status: 400 });
    }

    // Validate date format
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ 
        error: 'Invalid date format', 
        details: 'Please provide valid start and end dates' 
      }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json({ 
        error: 'Invalid date range', 
        details: 'End date must be after start date' 
      }, { status: 400 });
    }

    // Validate budget
    const budgetValue = parseFloat(budget);
    if (isNaN(budgetValue) || budgetValue < 0) {
      return NextResponse.json({ 
        error: 'Invalid budget', 
        details: 'Budget must be a positive number' 
      }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        priority,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: parseFloat(budget),
        agentName: agentName || null,
        phoneNumber: phoneNumber || null,
        cost: parseFloat(cost) || 0,
        paidAmount: parseFloat(paidAmount),
        progress: parseInt(progress),
        userId: user.id
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}