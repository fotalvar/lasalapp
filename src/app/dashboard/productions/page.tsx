import PageHeader from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

const productions = [
  { id: 'eco-2024', title: 'Eco', year: 2024, posterImageId: 'production-poster-1' },
  { id: 'laberint-2023', title: 'Laberint', year: 2023, posterImageId: 'production-poster-2' },
  { id: 'memoria-2022', title: 'Memòria', year: 2022, posterImageId: 'production-poster-3' },
];

export default function ProductionsPage() {
  return (
    <div className="flex-1">
      <PageHeader title="Producciones Propias">
        <div className="flex justify-end mt-4">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Producción
            </Button>
        </div>
      </PageHeader>
      <main className="p-4 md:px-6">
        <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {productions.map(prod => {
                const posterImage = PlaceHolderImages.find(img => img.id === prod.posterImageId);
                return (
                    <Link href={`/dashboard/productions/${prod.id}`} key={prod.id}>
                        <div className="group relative overflow-hidden rounded-lg hover:shadow-lg transition-shadow aspect-[2/3]">
                            {posterImage ? (
                                <Image 
                                    src={posterImage.imageUrl} 
                                    alt={`Póster para ${prod.title}`} 
                                    fill 
                                    className="object-cover"
                                    data-ai-hint={posterImage.imageHint}
                                />
                            ) : (
                                <div className="bg-secondary h-full w-full"></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <h3 className="text-primary-foreground text-sm font-bold truncate">{prod.title}</h3>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
      </main>
    </div>
  );
}
