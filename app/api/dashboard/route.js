import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';

// GET /api/dashboard
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

    // Get all financial data for the user
    const [incomes, expenses, payables, receivables] = await Promise.all([
      prisma.income.findMany({
        where: { userId: user.id },
      }),
      prisma.expense.findMany({
        where: { userId: user.id },
      }),
      prisma.payable.findMany({
        where: { userId: user.id },
      }),
      prisma.receivable.findMany({
        where: { userId: user.id },
      }),
    ]);

    // Calculate totals
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalPayables = payables.reduce((sum, payable) => sum + (payable.isPaid ? 0 : payable.amount), 0);
    const totalReceivables = receivables.reduce((sum, receivable) => sum + (receivable.isReceived ? 0 : receivable.amount), 0);

    // Get monthly data for the last 6 months
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    
    // Initialize monthly data arrays
    const months = [];
    const monthlyIncome = [];
    const monthlyExpenses = [];
    
    // Generate the last 6 months (including current month)
    for (let i = 0; i < 6; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      months.unshift(monthName);
    }
    
    // Calculate monthly totals
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      
      const monthIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate >= monthStart && incomeDate <= monthEnd;
      });
      
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      });
      
      const monthIncomeTotal = monthIncomes.reduce((sum, income) => sum + income.amount, 0);
      const monthExpenseTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      monthlyIncome.unshift(monthIncomeTotal);
      monthlyExpenses.unshift(monthExpenseTotal);
    }

    return NextResponse.json({
      stats: {
        totalIncome,
        totalExpenses,
        totalPayables,
        totalReceivables,
      },
      monthlyData: {
        labels: months,
        income: monthlyIncome,
        expenses: monthlyExpenses,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}