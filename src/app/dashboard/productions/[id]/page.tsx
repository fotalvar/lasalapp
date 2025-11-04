import PageHeader from "@/components/dashboard/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { teamMembers } from "@/lib/data";
import { FileText, Music, Link as LinkIcon, PlusCircle, Share2, Users } from "lucide-react";
import Image from "next/image";

const production = { id: 'eco-2024', title: 'Eco', year: 2024, posterImageId: 'production-poster-1', description: 'An immersive performance about the relationship between humanity and nature.' };
const collaborators = [teamMembers[0], teamMembers[2]];
const externalCollaborators = [
    { name: 'Guest Writer', avatarId: 'user-avatar-6' }
];

const assets = [
    { name: 'Final Script.pdf', type: 'script', link: '#', icon: FileText },
    { name: 'Main Theme.mp3', type: 'song', link: '#', icon: Music },
    { name: 'Moodboard', type: 'other', link: '#', icon: LinkIcon },
]

export default function ProductionDetailPage({ params }: { params: { id: string } }) {
  const posterImage = PlaceHolderImages.find(img => img.id === production.posterImageId);
  return (
    <div className="flex-1">
      <div className="relative h-48 md:h-64 w-full">
        {posterImage && (
            <Image src={posterImage.imageUrl} alt={`Poster for ${production.title}`} fill className="object-cover object-top" data-ai-hint={posterImage.imageHint} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <main className="-mt-16 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <div>
                    <p className="text-sm text-muted-foreground">{production.year}</p>
                    <h1 className="text-4xl font-bold tracking-tight font-headline text-foreground">{production.title}</h1>
                    <p className="mt-2 text-muted-foreground">{production.description}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Assets</CardTitle>
                            <Button variant="ghost" size="sm"><PlusCircle className="mr-2 h-4 w-4" />Add Link</Button>
                        </CardHeader>
                        <CardContent>
                           <ul className="space-y-2">
                            {assets.map(asset => (
                                <li key={asset.name}>
                                    <a href={asset.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                                        <asset.icon className="h-5 w-5 text-muted-foreground" />
                                        <span className="font-medium text-sm">{asset.name}</span>
                                        <LinkIcon className="h-4 w-4 text-muted-foreground ml-auto" />
                                    </a>
                                </li>
                            ))}
                           </ul>
                        </CardContent>
                    </Card>
                </div>
                <div>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Collaborators</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {collaborators.map(member => {
                                const avatar = PlaceHolderImages.find(p => p.id === member.avatar);
                                return (
                                <div key={member.id} className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={avatar?.imageUrl} data-ai-hint={avatar?.imageHint} />
                                        <AvatarFallback>{member.name.slice(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.role}</p>
                                    </div>
                                </div>
                            )})}
                            <h4 className="text-sm font-medium text-muted-foreground pt-2 border-t">External</h4>
                            {externalCollaborators.map(member => {
                                const avatar = PlaceHolderImages.find(p => p.id === member.avatarId);
                                return (
                                <div key={member.name} className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={avatar?.imageUrl} data-ai-hint={avatar?.imageHint} />
                                        <AvatarFallback>{member.name.slice(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{member.name}</p>
                                        <Badge variant="outline">View Only</Badge>
                                    </div>
                                </div>
                            )})}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
