// TransactionTable.jsx
import { QueryLoader } from "@/components/QueryLoader";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  PencilIcon,
  Trash2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TransactionTable({
  query,
  onEdit,
  onDelete,
  onPageChange,
  filters,
}) {
  return (
    <QueryLoader query={query}>
      {(data) => {
        const { list: txns, pagination } = data;
        console.log("pagination: ", pagination);

        return (
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>
                Transactions ({pagination?.totalCount || 0})
              </CardTitle>

              {/* Results info */}
              {pagination && (
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.currentPage - 1) * filters.limit + 1} to{" "}
                  {Math.min(
                    pagination.currentPage * filters.limit,
                    pagination.totalCount
                  )}{" "}
                  of {pagination.totalCount} results
                </div>
              )}
            </CardHeader>

            <CardContent className="overflow-x-auto">
              {txns.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No transactions found.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your filters or add a new transaction.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {txns.map((t) => (
                      <TableRow key={t._id}>
                        <TableCell>
                          {format(new Date(t.date), "dd MMM yyyy")}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              t.type === "income"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            )}
                          >
                            {t.type}
                          </Badge>
                        </TableCell>

                        <TableCell>{t.category?.name}</TableCell>

                        <TableCell>
                          <div className="max-w-32 truncate">
                            {t.description || t.note || "-"}
                          </div>
                        </TableCell>

                        <TableCell
                          className={cn(
                            "text-right font-mono",
                            t.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {t.type === "expense" ? "-" : "+"}₹
                          {t.amount.toLocaleString("en-IN")}
                        </TableCell>

                        <TableCell className="text-right space-x-1">
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

            {/* Pagination Footer */}
            {pagination && pagination.totalPages > 1 && (
              <CardFooter className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>

                <div className="flex items-center gap-2">
                  {/* First Page */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <ChevronsLeftIcon className="h-4 w-4" />
                  </Button>

                  {/* Previous Page */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(pagination.prevPage)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>

                  {/* Page Numbers */}
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum =
                        Math.max(1, pagination.currentPage - 2) + i;
                      if (pageNum > pagination.totalPages) return null;

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === pagination.currentPage
                              ? "default"
                              : "outline"
                          }
                          size="icon"
                          onClick={() => onPageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}

                  {/* Next Page */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(pagination.nextPage)}
                    disabled={!pagination.hasNextPage}
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>

                  {/* Last Page */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(pagination.totalPages)}
                    disabled={!pagination.hasNextPage}
                  >
                    <ChevronsRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        );
      }}
    </QueryLoader>
  );
}
