"use client";

import AdminClient from "@/components/dashboard/admin/admin-client";
import TeamClient from "@/components/dashboard/team/team-client";
import CompaniesClient from "@/components/dashboard/companies/companies-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building, Shield } from "lucide-react";

export default function AdminTabs() {
  return (
    <Tabs defaultValue="roles" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="roles" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Roles
        </TabsTrigger>
        <TabsTrigger value="team" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Equipo
        </TabsTrigger>
        <TabsTrigger value="companies" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Compañías
        </TabsTrigger>
      </TabsList>

      <TabsContent value="roles">
        <AdminClient />
      </TabsContent>

      <TabsContent value="team">
        <TeamClient />
      </TabsContent>

      <TabsContent value="companies">
        <CompaniesClient />
      </TabsContent>
    </Tabs>
  );
}
