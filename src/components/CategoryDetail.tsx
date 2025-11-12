import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddLinkDialog from "./AddLinkDialog";
import AddNoteDialog from "./AddNoteDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Category {
  id: string;
  title: string;
}

interface Link {
  id: string;
  title: string;
  url: string;
  description: string | null;
}

interface Note {
  id: string;
  title: string;
  content: string | null;
}

interface CategoryDetailProps {
  category: Category;
  onBack: () => void;
  onCategoryDeleted: () => void;
}

const CategoryDetail = ({ category, onBack, onCategoryDeleted }: CategoryDetailProps) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchLinks();
    fetchNotes();
  }, [category.id]);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("category_id", category.id)
      .order("created_at", { ascending: false });

    if (!error) setLinks(data || []);
  };

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("category_id", category.id)
      .order("created_at", { ascending: false });

    if (!error) setNotes(data || []);
  };

  const deleteLink = async (id: string) => {
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (!error) {
      toast.success("Link deleted");
      fetchLinks();
    }
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (!error) {
      toast.success("Note deleted");
      fetchNotes();
    }
  };

  const deleteCategory = async () => {
    const { error } = await supabase.from("categories").delete().eq("id", category.id);
    if (!error) {
      toast.success("Category deleted");
      onCategoryDeleted();
    } else {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{category.title}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="links" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Saved Links</h3>
              <Button onClick={() => setIsAddLinkOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>

            {links.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No links yet. Add your first resource! 🔗
              </p>
            ) : (
              <div className="space-y-3">
                {links.map((link) => (
                  <Card key={link.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary transition-colors"
                            >
                              {link.title}
                            </a>
                          </CardTitle>
                          {link.description && (
                            <CardDescription className="mt-2">
                              {link.description}
                            </CardDescription>
                          )}
                          <p className="text-xs text-muted-foreground mt-2 break-all">
                            {link.url}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteLink(link.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Notes</h3>
              <Button onClick={() => setIsAddNoteOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>

            {notes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Your notes tab is empty. Jot something inspiring! 💡
              </p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <Card key={note.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{note.title}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    {note.content && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AddLinkDialog
        open={isAddLinkOpen}
        onOpenChange={setIsAddLinkOpen}
        categoryId={category.id}
        onLinkAdded={() => {
          fetchLinks();
          setIsAddLinkOpen(false);
        }}
      />

      <AddNoteDialog
        open={isAddNoteOpen}
        onOpenChange={setIsAddNoteOpen}
        categoryId={category.id}
        onNoteAdded={() => {
          fetchNotes();
          setIsAddNoteOpen(false);
        }}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{category.title}" and all its links and notes.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCategory} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryDetail;
