"use client";

import { useState } from 'react';
import type { Todo } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function TodosClient({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState('');

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    const newId = `todo-${Date.now()}`;
    setTodos([{ id: newId, text: newTodo, completed: false }, ...todos]);
    setNewTodo('');
  };

  const handleToggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  }

  const completedTodos = todos.filter(t => t.completed);
  const activeTodos = todos.filter(t => !t.completed);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Add a new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
            />
            <Button onClick={handleAddTodo}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-4">
            <div className='space-y-2'>
                {activeTodos.map((todo) => (
                    <div key={todo.id} className="flex items-center gap-3 p-3 rounded-md border bg-card hover:bg-muted/50 group">
                        <Checkbox
                            id={todo.id}
                            checked={todo.completed}
                            onCheckedChange={() => handleToggleTodo(todo.id)}
                        />
                        <div className="flex-1">
                            <label htmlFor={todo.id} className="text-sm font-medium">
                            {todo.text}
                            </label>
                            {todo.dueDate && <p className="text-xs text-muted-foreground">{format(todo.dueDate, 'MMM d')}</p>}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteTodo(todo.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                ))}
            </div>

            {completedTodos.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground my-4">Completed ({completedTodos.length})</h3>
                    <div className="space-y-2">
                        {completedTodos.map((todo) => (
                            <div key={todo.id} className="flex items-center gap-3 p-3 rounded-md border bg-muted/30 group">
                                <Checkbox
                                    id={todo.id}
                                    checked={todo.completed}
                                    onCheckedChange={() => handleToggleTodo(todo.id)}
                                />
                                <label
                                    htmlFor={todo.id}
                                    className={cn("text-sm flex-1 text-muted-foreground line-through")}
                                >
                                    {todo.text}
                                </label>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteTodo(todo.id)}>
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
