"use client";

import { useState, useMemo } from "react";
import type { Expense, TeamMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Trash2, Upload } from "lucide-react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

function AddExpenseSheet({
  onSave,
  teamMembers,
}: {
  onSave: (expense: Expense) => void;
  teamMembers: TeamMember[];
}) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<Expense["type"]>("Gasto");
  const [category, setCategory] = useState<Expense["category"] | undefined>();
  const [paidBy, setPaidBy] = useState<string | undefined>();

  const handleSave = () => {
    if (!description || !amount || !category || !paidBy) return;
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      date: new Date(),
      description,
      amount: parseFloat(amount),
      type,
      category,
      amortization: 1,
      paidBy,
    };
    onSave(newExpense);
    setOpen(false);
    setDescription("");
    setAmount("");
    setType("Gasto");
    setCategory(undefined);
    setPaidBy(undefined);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-soft hover:shadow-md transition-all">
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Transacción
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Añadir Nueva Transacción</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={type}
              onValueChange={(v: Expense["type"]) => {
                setType(v);
                setCategory(undefined); // Reset category when type changes
              }}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gasto">Gasto</SelectItem>
                <SelectItem value="Ingreso">Ingreso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Cantidad (€)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={category}
              onValueChange={(v: Expense["category"]) => setCategory(v)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {type === "Gasto" ? (
                  <>
                    <SelectItem value="Mobiliario">Mobiliario</SelectItem>
                    <SelectItem value="Reformas">Reformas</SelectItem>
                    <SelectItem value="Materiales">Materiales</SelectItem>
                    <SelectItem value="Comida">Comida</SelectItem>
                    <SelectItem value="Suministros">Suministros</SelectItem>
                    <SelectItem value="Producciones">Producciones</SelectItem>
                    <SelectItem value="Documentación">Documentación</SelectItem>
                    <SelectItem value="Fungible">Fungible</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="Pago de bolos">Pago de bolos</SelectItem>
                    <SelectItem value="Subvenciones">Subvenciones</SelectItem>
                    <SelectItem value="Aportación de miembro">
                      Aportación de miembro
                    </SelectItem>
                    <SelectItem value="Otros ingresos">
                      Otros ingresos
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="paidBy">Pagado por</Label>
            <Select value={paidBy} onValueChange={(v: string) => setPaidBy(v)}>
              <SelectTrigger id="paidBy">
                <SelectValue placeholder="Seleccionar quién pagó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tarjeta de la empresa">
                  Tarjeta de la empresa
                </SelectItem>
                {teamMembers &&
                  teamMembers.length > 0 &&
                  teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Tipos válidos de categorías según el tipo de transacción
const expenseCategories: Expense["category"][] = [
  "Mobiliario",
  "Reformas",
  "Materiales",
  "Comida",
  "Suministros",
  "Producciones",
  "Documentación",
  "Fungible",
];

const incomeCategories: Expense["category"][] = [
  "Pago de bolos",
  "Subvenciones",
  "Aportación de miembro",
  "Otros ingresos",
];

interface ValidationError {
  line: number;
  message: string;
}

function BulkImportSheet({
  onSave,
  teamMembers,
}: {
  onSave: (expenses: Expense[]) => void;
  teamMembers: TeamMember[];
}) {
  const [open, setOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [validExpenses, setValidExpenses] = useState<Expense[]>([]);

  const validateAndParse = () => {
    const lines = bulkText.split("\n").filter((line) => line.trim());
    const newErrors: ValidationError[] = [];
    const newExpenses: Expense[] = [];

    lines.forEach((line, index) => {
      const parts = line.split("\t").map((p) => p.trim());

      if (parts.length !== 4) {
        newErrors.push({
          line: index + 1,
          message: `Formato incorrecto. Se esperan 4 columnas separadas por tabulador (Descripción, Categoría, Cantidad, Persona). Se encontraron ${parts.length}.`,
        });
        return;
      }

      const [description, category, amountStr, paidBy] = parts;

      // Validar descripción
      if (!description) {
        newErrors.push({
          line: index + 1,
          message: "La descripción no puede estar vacía.",
        });
        return;
      }

      // Validar categoría
      const allCategories = [...expenseCategories, ...incomeCategories];
      if (!allCategories.includes(category as Expense["category"])) {
        newErrors.push({
          line: index + 1,
          message: `Categoría "${category}" no válida. Debe ser una de: ${allCategories.join(
            ", "
          )}`,
        });
        return;
      }

      // Validar cantidad
      const amount = parseFloat(amountStr.replace(",", "."));
      if (isNaN(amount) || amount <= 0) {
        newErrors.push({
          line: index + 1,
          message: `Cantidad "${amountStr}" no válida. Debe ser un número positivo.`,
        });
        return;
      }

      // Validar persona
      const validPeople = [
        "Tarjeta de la empresa",
        ...teamMembers.map((m) => m.name),
      ];
      if (!validPeople.includes(paidBy)) {
        newErrors.push({
          line: index + 1,
          message: `Persona "${paidBy}" no válida. Debe ser uno de: ${validPeople.join(
            ", "
          )}`,
        });
        return;
      }

      // Determinar tipo basado en categoría
      const type: Expense["type"] = incomeCategories.includes(
        category as Expense["category"]
      )
        ? "Ingreso"
        : "Gasto";

      // Crear gasto válido
      newExpenses.push({
        id: `exp-${Date.now()}-${index}`,
        date: new Date(),
        description,
        type,
        category: category as Expense["category"],
        amount,
        amortization: 1,
        paidBy,
      });
    });

    setErrors(newErrors);
    setValidExpenses(newExpenses);
  };

  const handleSave = () => {
    validateAndParse();
    if (errors.length === 0 && validExpenses.length > 0) {
      onSave(validExpenses);
      setOpen(false);
      setBulkText("");
      setErrors([]);
      setValidExpenses([]);
    }
  };

  const handleValidate = () => {
    validateAndParse();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start bg-white/60 backdrop-blur-sm shadow-soft hover:shadow-md transition-all border-white/60"
        >
          <Upload className="mr-2 h-4 w-4" />
          Importación Masiva
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Importación Masiva de Transacciones</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="bulkText">
              Pegar datos (Descripción TAB Categoría TAB Cantidad TAB Persona)
            </Label>
            <Textarea
              id="bulkText"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Obramat	Reformas	15.47	Víctor&#10;Mercadona	Comida	42.30	Anna&#10;Concierto	Pago de bolos	500	Tarjeta de la empresa"
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Formato: Una transacción por línea, campos separados por
                tabulador (TAB)
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">
                  Ver categorías válidas
                </summary>
                <div className="mt-2 space-y-2 pl-4">
                  <div>
                    <strong>Gastos:</strong> {expenseCategories.join(", ")}
                  </div>
                  <div>
                    <strong>Ingresos:</strong> {incomeCategories.join(", ")}
                  </div>
                  <div>
                    <strong>Personas:</strong> Tarjeta de la empresa,{" "}
                    {teamMembers.map((m) => m.name).join(", ")}
                  </div>
                </div>
              </details>
            </div>
          </div>

          <Button onClick={handleValidate} variant="secondary">
            Validar
          </Button>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <div className="font-semibold mb-2">
                  Se encontraron {errors.length} errores:
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  {errors.map((error, idx) => (
                    <li key={idx}>
                      Línea {error.line}: {error.message}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validExpenses.length > 0 && errors.length === 0 && (
            <Alert>
              <AlertDescription>
                <div className="font-semibold mb-2">
                  ✓ {validExpenses.length} transacciones válidas encontradas
                </div>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  {validExpenses.map((expense, idx) => (
                    <li key={idx}>
                      {expense.description} - {expense.category} - €
                      {expense.amount} - {expense.paidBy}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={bulkText.trim() === "" || validExpenses.length === 0}
          >
            Importar {validExpenses.length} transacciones
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default function ExpensesClient({
  initialExpenses,
}: {
  initialExpenses: Expense[];
}) {
  const { toast } = useToast();

  // Cargar miembros del equipo desde Firestore
  const db = useFirestore();
  const membersQuery = useMemoFirebase(
    () => (db ? collection(db, "teamMembers") : null),
    [db]
  );
  const { data: teamMembers } = useCollection<TeamMember>(membersQuery);

  // Cargar gastos desde Firestore
  const expensesQuery = useMemoFirebase(
    () => (db ? collection(db, "expenses") : null),
    [db]
  );
  const { data: firestoreExpenses } = useCollection<Expense>(expensesQuery);

  // Convertir Timestamps a Date y usar gastos de Firestore si existen
  const expenses = useMemo(() => {
    if (firestoreExpenses) {
      return firestoreExpenses.map((expense) => ({
        ...expense,
        date:
          expense.date instanceof Timestamp
            ? expense.date.toDate()
            : expense.date,
      }));
    }
    return initialExpenses;
  }, [firestoreExpenses, initialExpenses]);

  const handleSaveExpense = async (expense: Expense) => {
    if (!db) return;

    try {
      // Crear copia del gasto sin el id temporal
      const { id, ...expenseData } = expense;

      await addDoc(collection(db, "expenses"), {
        ...expenseData,
        date: expense.date,
      });

      toast({
        title: "Transacción añadida",
        description: `${expense.description} ha sido añadida.`,
      });
    } catch (error) {
      console.error("Error al guardar gasto:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la transacción.",
        variant: "destructive",
      });
    }
  };

  const handleSaveBulkExpenses = async (newExpenses: Expense[]) => {
    if (!db) return;

    try {
      // Guardar todos los gastos en Firestore
      const promises = newExpenses.map((expense) => {
        const { id, ...expenseData } = expense;
        return addDoc(collection(db, "expenses"), {
          ...expenseData,
          date: expense.date,
        });
      });

      await Promise.all(promises);

      toast({
        title: "Transacciones importadas",
        description: `${newExpenses.length} transacciones han sido añadidas.`,
      });
    } catch (error) {
      console.error("Error al importar gastos:", error);
      toast({
        title: "Error",
        description: "No se pudieron importar todas las transacciones.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!db) return;

    try {
      await deleteDoc(doc(db, "expenses", id));

      toast({
        title: "Transacción eliminada",
        description: "La transacción ha sido eliminada.",
      });
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la transacción.",
        variant: "destructive",
      });
    }
  };

  // Si no hay miembros del equipo cargados, mostrar loading o vacío
  if (!teamMembers) {
    return (
      <div className="grid gap-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">
            Cargando miembros del equipo...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] px-6 md:px-8 py-6">
      {/* Sidebar */}
      <aside className="w-64 pr-4 space-y-6 overflow-y-auto">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
            Acciones
          </h3>

          <AddExpenseSheet
            onSave={handleSaveExpense}
            teamMembers={teamMembers}
          />

          <BulkImportSheet
            onSave={handleSaveBulkExpenses}
            teamMembers={teamMembers}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="border rounded-lg bg-white/40 backdrop-blur-md border-white/60 shadow-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead>Pagado por</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(expense.date, "d MMM, yyyy")}</TableCell>
                  <TableCell>
                    <span
                      className={
                        expense.type === "Ingreso"
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {expense.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {expense.description}
                  </TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        expense.type === "Ingreso" ? "text-green-600" : ""
                      }
                    >
                      {expense.type === "Ingreso" ? "+" : "-"}€
                      {expense.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>{expense.paidBy}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
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
      </main>
    </div>
  );
}
