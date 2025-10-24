import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "@/components/Dashboard";
import BookCatalog from "@/components/BookCatalog";
import AddBookForm from "@/components/AddBookForm";
import IssueBookForm from "@/components/IssueBookForm";
import MembersList from "@/components/MembersList";
import { BookOpen, Plus, Users, ArrowLeftRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <Dashboard />

        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="catalog" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Catalog</span>
            </TabsTrigger>
            <TabsTrigger value="add" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Book</span>
            </TabsTrigger>
            <TabsTrigger value="issue" className="gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              <span className="hidden sm:inline">Issue/Return</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Members</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="mt-6">
            <BookCatalog />
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <AddBookForm />
          </TabsContent>

          <TabsContent value="issue" className="mt-6">
            <IssueBookForm />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <MembersList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
