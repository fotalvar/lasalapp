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
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const chartConfig = {
  amount: {
    label: 'Cantidad',
  },
  Estructural: {
    label: 'Estructural',
    color: 'hsl(var(--chart-1))',
  },
  Materiales: {
    label: 'Materiales',
    color: 'hsl(var(--chart-2))',
  },
  Producción: {
    label: 'Producción',
    color: 'hsl(var(--chart-3))',
  },
  Marketing: {
    label: 'Marketing',
    color: 'hsl(var(--chart-4))',
  },
  Otros: {
    label: 'Otros',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

function AddExpenseSheet({ onSave }: { onSave: (expense: Expense) => void }) {
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
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Gasto
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Añadir Nuevo Gasto</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Cantidad (€)</Label>
                        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Categoría</Label>
                        <Select value={category} onValueChange={(v: Expense['category']) => setCategory(v)}>
                            <SelectTrigger id="category"><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Estructural">Estructural</SelectItem>
                                <SelectItem value="Materiales">Materiales</SelectItem>
                                <SelectItem value="Producción">Producción</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Otros">Otros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amortization">Amortización (años)</Label>
                        <Input id="amortization" type="number" value={amortization} onChange={(e) => setAmortization(e.target.value)} />
                    </div>
                </div>
                <SheetFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar Gasto</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
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
          <CardTitle>Gastos por Categoría</CardTitle>
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
            <AddExpenseSheet onSave={handleSaveExpense} />
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-center">Amortización</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(expense.date, 'd MMM, yyyy')}</TableCell>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="text-right">€{expense.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{expense.amortization} año(s)</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteExpense(expense.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Borrar
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
