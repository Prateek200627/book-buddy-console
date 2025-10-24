import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { BookUp, BookDown } from "lucide-react";

const IssueBookForm = () => {
  const queryClient = useQueryClient();
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [action, setAction] = useState<"issue" | "return">("issue");

  const { data: books } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*").order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: members } = useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const { data, error } = await supabase.from("members").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: issuedBooks } = useQuery({
    queryKey: ["issued-books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("issued_books")
        .select("*, books(*), members(*)")
        .is("returned_at", null);
      if (error) throw error;
      return data;
    },
  });

  const issueBookMutation = useMutation({
    mutationFn: async () => {
      const book = books?.find((b) => b.id === selectedBook);
      if (!book || book.available_copies < 1) {
        throw new Error("Book not available");
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // 2 weeks loan period

      const { error: issueError } = await supabase.from("issued_books").insert({
        book_id: selectedBook,
        member_id: selectedMember,
        due_date: dueDate.toISOString(),
      });

      if (issueError) throw issueError;

      const { error: updateError } = await supabase
        .from("books")
        .update({ available_copies: book.available_copies - 1 })
        .eq("id", selectedBook);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["issued-books"] });
      toast.success("Book issued successfully!");
      setSelectedBook("");
      setSelectedMember("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to issue book");
    },
  });

  const returnBookMutation = useMutation({
    mutationFn: async (issuedBookId: string) => {
      const issuedBook = issuedBooks?.find((ib) => ib.id === issuedBookId);
      if (!issuedBook) throw new Error("Issue record not found");

      const { error: returnError } = await supabase
        .from("issued_books")
        .update({ returned_at: new Date().toISOString() })
        .eq("id", issuedBookId);

      if (returnError) throw returnError;

      const book = books?.find((b) => b.id === issuedBook.book_id);
      if (book) {
        const { error: updateError } = await supabase
          .from("books")
          .update({ available_copies: book.available_copies + 1 })
          .eq("id", book.id);

        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["issued-books"] });
      toast.success("Book returned successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to return book");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !selectedMember) {
      toast.error("Please select both book and member");
      return;
    }
    issueBookMutation.mutate();
  };

  const availableBooks = books?.filter((book) => book.available_copies > 0);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <BookUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Issue Book</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Book</Label>
            <Select value={selectedBook} onValueChange={setSelectedBook}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a book" />
              </SelectTrigger>
              <SelectContent>
                {availableBooks?.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title} - {book.author} ({book.available_copies} available)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Member</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a member" />
              </SelectTrigger>
              <SelectContent>
                {members?.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {member.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={issueBookMutation.isPending} className="w-full">
            {issueBookMutation.isPending ? "Issuing..." : "Issue Book"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <BookDown className="h-6 w-6 text-accent" />
          <h2 className="text-2xl font-bold">Currently Issued Books</h2>
        </div>

        {issuedBooks?.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No books currently issued</p>
        ) : (
          <div className="space-y-3">
            {issuedBooks?.map((issue) => (
              <div
                key={issue.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-semibold">{issue.books?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Issued to: {issue.members?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due: {new Date(issue.due_date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => returnBookMutation.mutate(issue.id)}
                  disabled={returnBookMutation.isPending}
                >
                  Return
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default IssueBookForm;
