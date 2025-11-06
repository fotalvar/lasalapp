import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
            <h1 className="text-4xl font-bold mb-4">Bienvenido al Portal Público</h1>
            <p className="text-muted-foreground mb-8 max-w-md">
                Esta sección está en construcción. Próximamente encontrarás aquí los formularios y la información pública de laSala.
            </p>
            <Link href="/login">
                <Button>Volver al Inicio de Sesión</Button>
            </Link>
        </div>
    )
}
