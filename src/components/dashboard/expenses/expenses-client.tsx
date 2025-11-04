"use client";

import { useState, useMemo } from 'react';
import type { Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const chartConfig = {
  amount: {
    label: 'Amount',
  },
  Structural: {
    label: 'Structural',
    color: 'hsl(var(--chart-1))',
  },
  Materials: {
    label: 'Materials',
    color: 'hsl(var(--chart-2))',
  },
  Production: {
    label: 'Production',
    color: 'hsl(var(--chart-3))',
  },
  Marketing: {
    label: 'Marketing',
    color: 'hsl(var(--chart-4))',
  },
  Other: {
    label: 'Other',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

function AddExpenseDialog({ onSave }: { onSave: (expense: Expense) => void }) {
    const [open, setOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<Expense['category'] | undefined>();
    const [amortization, setAmortization] = useState('1');

    const handleSave = () => {
        if (!description || !amount || !category) return;
        const newExpense: Expense = {
            id: `exp-${Date.now()}`,
            date: new Date(),
            description,
            amount: parseFloat(amount),
            category,
            amortization: parseInt(amortization)
        };
        onSave(newExpense);
        setOpen(false);
        setDescription('');
        setAmount('');
        setCategory(undefined);
        setAmortization('1');
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Expense
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount (€)</Label>
                        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={(v: Expense['category']) => setCategory(v)}>
                            <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Structural">Structural</SelectItem>
                                <SelectItem value="Materials">Materials</SelectItem>
                                <SelectItem value="Production">Production</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amortization">Amortization (years)</Label>
                        <Input id="amortization" type="number" value={amortization} onChange={(e) => setAmortization(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Save Expense</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function ExpensesClient({ initialExpenses }: { initialExpenses: Expense[] }) {
  const [expenses, setExpenses] = useState(initialExpenses);

  const chartData = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {} as { [key: string]: number });

    return Object.keys(categoryTotals).map(category => ({
      category,
      amount: categoryTotals[category],
      fill: `var(--color-${category})`,
    }));
  }, [expenses]);
  
  const handleSaveExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  }
  
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <XAxis dataKey="category" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis tickFormatter={(value) => `€${value / 1000}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="amount" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <div>
        <div className="flex justify-end mb-4">
            <AddExpenseDialog onSave={handleSaveExpense} />
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Amortization</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(expense.date, 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="text-right">€{expense.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{expense.amortization} yr(s)</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteExpense(expense.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
