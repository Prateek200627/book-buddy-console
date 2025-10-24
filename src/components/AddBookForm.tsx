import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { BookPlus } from "lucide-react";

const AddBookForm = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    publication_year: "",
    total_copies: "1",
  });

  const addBookMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("books").insert({
        ...data,
        publication_year: data.publication_year ? parseInt(data.publication_year) : null,
        total_copies: parseInt(data.total_copies),
        available_copies: parseInt(data.total_copies),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book added successfully!");
      setFormData({
        title: "",
        author: "",
        isbn: "",
        category: "",
        publication_year: "",
        total_copies: "1",
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add book");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    addBookMutation.mutate(formData);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BookPlus className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Add New Book</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author *</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN</Label>
            <Input
              id="isbn"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Fiction, Science, History"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publication_year">Publication Year</Label>
            <Input
              id="publication_year"
              type="number"
              value={formData.publication_year}
              onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
              min="1800"
              max={new Date().getFullYear()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_copies">Total Copies *</Label>
            <Input
              id="total_copies"
              type="number"
              value={formData.total_copies}
              onChange={(e) => setFormData({ ...formData, total_copies: e.target.value })}
              min="1"
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={addBookMutation.isPending} className="w-full">
          {addBookMutation.isPending ? "Adding..." : "Add Book"}
        </Button>
      </form>
    </Card>
  );
};

export default AddBookForm;
