import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlusIcon, AlertTriangleIcon } from "lucide-react";
import { useCategories, useDeleteCategory } from "@/hooks/useCategories";
import CategoryTable from "./CategoryTable";
import CategoryDialog from "./CategoryDialog";

export default function CategoriesPage() {
  const categoriesQuery = useCategories();
  const deleteMutation = useDeleteCategory();

  const [editOpen, setEditOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const handleEdit = (category) => {
    if (category.isDefault) return; // prevent editing defaults
    setEditCategory(category);
    setEditOpen(true);
  };

  const handleDelete = (category) => {
    if (category.isDefault) return; // prevent deleting defaults
    if (confirm(`Delete "${category.name}" category?`)) {
      deleteMutation.mutate(category._id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {deleteMutation.isError && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Delete Failed</AlertTitle>
          <AlertDescription>
            {deleteMutation.error?.response?.data?.message ??
              "Unknown error occurred"}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your income and expense categories
          </p>
        </div>

        {/* Add Button */}
        <CategoryDialog
          trigger={
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          }
        />
      </div>

      {/* Table */}
      <CategoryTable
        query={categoriesQuery}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Dialog */}
      {editCategory && (
        <CategoryDialog
          initial={editCategory}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  );
}
