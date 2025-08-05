import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useTransactions, useDeleteTransaction } from "@/hooks/useTransactions";
import TransactionTable from "./TransactionTable";
import TransactionDialog from "./TransactionDialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function TransactionsPage() {
  const txQuery = useTransactions();
  const delMutation = useDeleteTransaction();

  // state for edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);

  const handleEdit = (tx) => {
    setEditTx(tx);
    setEditOpen(true);
  };
  const handleDelete = (tx) => delMutation.mutate(tx._id);

  return (
    <div className="space-y-6">
      {delMutation.isError && (
        <Alert variant="destructive">
          <AlertTitle>Delete failed</AlertTitle>
          <AlertDescription>
            {delMutation.error?.response?.data?.message ?? "Unknown error"}
          </AlertDescription>
        </Alert>
      )}

      {/*  ADD button uses trigger mode  */}
      <div className="flex justify-end">
        <TransactionDialog
          trigger={
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" /> Add Transaction
            </Button>
          }
        />
      </div>

      {/*  Table  */}
      <TransactionTable
        query={txQuery}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/*  EDIT dialog — controlled mode, no trigger  */}

      {editTx && (
        <TransactionDialog
          initial={editTx}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  );
}
