import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';

// GET /api/dashboard
export async function GET(request) {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const allTransactions = searchParams.get('allTransactions') === 'true';

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all financial data for the user
    const [incomes, expenses, payables, receivables, projects] = await Promise.all([
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
      prisma.project.findMany({
        where: { userId: user.id },
      }),
    ]);

    // Calculate totals
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const projectRevenue = projects.filter(project => project.status === 'completed').reduce((sum, project) => sum + ((project.budget || 0) - (project.cost || 0)), 0);
    const totalIncomeWithRevenue = totalIncome + projectRevenue;
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalPayables = payables.reduce((sum, payable) => sum + (payable.isPaid ? 0 : payable.amount), 0);
    const totalReceivables = receivables.reduce((sum, receivable) => sum + (receivable.isReceived ? 0 : receivable.amount), 0);

    // Calculate project statistics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(project => project.status === 'in-progress').length;
    const completedProjects = projects.filter(project => project.status === 'completed').length;
    const planningProjects = projects.filter(project => project.status === 'planning').length;
    const dueProjects = projects.filter(project => project.status === 'due').length;
    const totalProjectBudget = projects.filter(project => project.status !== 'completed').reduce((sum, project) => sum + (project.budget || 0), 0);
    const totalProjectCost = projects.reduce((sum, project) => sum + (project.cost || 0), 0);
    const totalProjectRevenue = projects.filter(project => project.status === 'completed').reduce((sum, project) => sum + ((project.budget || 0) - (project.cost || 0)), 0);
    const totalProjectPaidAmount = projects.reduce((sum, project) => sum + (project.paidAmount || 0), 0);

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

    // Combine all transactions and sort by date descending
    const allTransactionsList = [
      ...incomes.map(tx => ({
        ...tx,
        type: 'income',
        date: tx.date || tx.createdAt
      })),
      ...expenses.map(tx => ({
        ...tx,
        type: 'expense',
        date: tx.date || tx.createdAt
      })),
      ...payables.map(tx => ({
        ...tx,
        type: 'payable',
        date: tx.dueDate || tx.createdAt
      })),
      ...receivables.map(tx => ({
        ...tx,
        type: 'receivable',
        date: tx.dueDate || tx.createdAt
      })),
    ];
    allTransactionsList.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestTransactions = allTransactionsList.slice(0, 5);

    if (allTransactions) {
      return NextResponse.json({
        allTransactions: allTransactionsList,
      });
    }

    return NextResponse.json({
      stats: {
        totalIncome: totalIncomeWithRevenue,
        totalExpenses,
        totalPayables,
        totalReceivables,
        totalProjects,
        activeProjects,
        completedProjects,
        planningProjects,
        dueProjects,
        totalProjectBudget,
        totalProjectCost,
        totalProjectRevenue,
        totalProjectPaidAmount,
      },
      monthlyData: {
        labels: months,
        income: monthlyIncome,
        expenses: monthlyExpenses,
      },
      latestTransactions,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}