import { QueryLoader } from "@/components/QueryLoader";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { format } from "date-fns";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TransactionTable({ query, onEdit, onDelete }) {
  return (
    <QueryLoader query={query}>
      {(txns) => (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>All Transactions</CardTitle>
            {/* optional extra actions */}
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {txns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txns.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell>
                        {format(new Date(t.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>{t.category?.name}</TableCell>
                      <TableCell className="text-right">
                        {t.type === "expense" ? "-" : ""}
                        {t.amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="w-24 text-right space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(t)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDelete(t)}
                        >
                          <Trash2Icon className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </QueryLoader>
  );
}
