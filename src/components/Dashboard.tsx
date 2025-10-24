import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Users, BookMarked, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const { data: books } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: members } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await supabase.from("members").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: issuedBooks } = useQuery({
    queryKey: ["issued-books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("issued_books")
        .select("*")
        .is("returned_at", null);
      if (error) throw error;
      return data;
    },
  });

  const totalBooks = books?.reduce((sum, book) => sum + book.total_copies, 0) || 0;
  const availableBooks = books?.reduce((sum, book) => sum + book.available_copies, 0) || 0;
  const totalMembers = members?.length || 0;
  const currentlyIssued = issuedBooks?.length || 0;

  const stats = [
    {
      title: "Total Books",
      value: totalBooks,
      icon: BookOpen,
      color: "text-primary",
    },
    {
      title: "Available",
      value: availableBooks,
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      title: "Currently Issued",
      value: currentlyIssued,
      icon: BookMarked,
      color: "text-accent",
    },
    {
      title: "Total Members",
      value: totalMembers,
      icon: Users,
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-12 bg-gradient-to-br from-primary/10 via-accent/5 to-background rounded-lg">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Library Management System
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Manage your library's books, members, and borrowing records with ease
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <stat.icon className={`h-12 w-12 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
