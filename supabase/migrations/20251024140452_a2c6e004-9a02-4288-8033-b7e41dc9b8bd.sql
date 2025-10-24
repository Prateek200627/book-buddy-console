-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  category TEXT NOT NULL,
  publication_year INTEGER,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create members table
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  membership_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create issued_books table
CREATE TABLE public.issued_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  returned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_books ENABLE ROW LEVEL SECURITY;

-- Create public access policies (library data is public)
CREATE POLICY "Anyone can view books" 
  ON public.books FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert books" 
  ON public.books FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update books" 
  ON public.books FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can view members" 
  ON public.members FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert members" 
  ON public.members FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view issued books" 
  ON public.issued_books FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert issued books" 
  ON public.issued_books FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update issued books" 
  ON public.issued_books FOR UPDATE 
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_books_category ON public.books(category);
CREATE INDEX idx_books_author ON public.books(author);
CREATE INDEX idx_issued_books_book_id ON public.issued_books(book_id);
CREATE INDEX idx_issued_books_member_id ON public.issued_books(member_id);
CREATE INDEX idx_issued_books_returned_at ON public.issued_books(returned_at);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on books
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();