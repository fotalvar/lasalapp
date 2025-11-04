import PageHeader from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Megaphone, Ticket } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

const events = [
  {
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    title: "Eco - Noche de estreno",
    type: "performance",
  },
  {
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    title: "Publicación en redes sociales para Laberint",
    type: "marketing",
  },
  {
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    title: "Entradas anticipadas a la venta",
    type: "tickets",
  },
  {
    date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    title: "Eco - Función",
    type: "performance",
  },
];

const eventIcons = {
  performance: <CalendarIcon className="h-4 w-4 text-muted-foreground" />,
  marketing: <Megaphone className="h-4 w-4 text-muted-foreground" />,
  tickets: <Ticket className="h-4 w-4 text-muted-foreground" />,
};

export default function CalendarPage() {
  return (
    <div className="flex-1">
      <PageHeader
        title="Calendario y Programación"
        description="Gestiona horarios de eventos, funciones confirmadas y actividades de marketing."
      />
      <main className="p-4 md:p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-2 md:p-6">
            <Calendar
              mode="single"
              selected={new Date()}
              className="rounded-md"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 w-full",
                table: "w-full border-collapse space-y-1",
                head_row: "flex justify-around",
                head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                row: "flex w-full mt-2 justify-around",
                cell: "h-9 w-14 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-14 w-14 p-0 font-normal aria-selected:opacity-100",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                    {eventIcons[event.type as keyof typeof eventIcons]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date.toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
