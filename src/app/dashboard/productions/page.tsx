import PageHeader from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const productions = [
  { id: 'eco-2024', title: 'Eco', year: 2024, posterImageId: 'production-poster-1' },
  { id: 'laberint-2023', title: 'Laberint', year: 2023, posterImageId: 'production-poster-2' },
  { id: 'memoria-2022', title: 'Memòria', year: 2022, posterImageId: 'production-poster-3' },
];

export default function ProductionsPage() {
  return (
    <div className="flex-1">
      <PageHeader
        title="In-House Productions"
        description="Private hubs for your productions, with view-only access for external collaborators."
      />
      <main className="p-4 md:p-6">
        <div className="flex justify-end mb-4">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Production
            </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productions.map(prod => {
                const posterImage = PlaceHolderImages.find(img => img.id === prod.posterImageId);
                return (
                    <Link href={`/dashboard/productions/${prod.id}`} key={prod.id}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <CardHeader className="p-0">
                                <div className="aspect-[2/3] relative">
                                    {posterImage ? (
                                        <Image 
                                            src={posterImage.imageUrl} 
                                            alt={`Poster for ${prod.title}`} 
                                            fill 
                                            className="object-cover"
                                            data-ai-hint={posterImage.imageHint}
                                        />
                                    ) : (
                                        <div className="bg-secondary h-full w-full"></div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <CardTitle className="text-lg">{prod.title}</CardTitle>
                                <CardDescription>{prod.year}</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                );
            })}
        </div>
      </main>
    </div>
  );
}
