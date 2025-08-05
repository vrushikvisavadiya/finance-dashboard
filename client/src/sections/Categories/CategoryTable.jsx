import { QueryLoader } from "@/components/QueryLoader";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PencilIcon, Trash2Icon, ShieldIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CategoryTable({ query, onEdit, onDelete }) {
  return (
    <QueryLoader query={query}>
      {(categories) => (
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No categories found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "w-3 h-3 rounded-full",
                              cat.type === "income"
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            )}
                          />
                          {cat.name}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            cat.type === "income"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          )}
                        >
                          {cat.type}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {cat.isDefault ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <ShieldIcon className="h-3 w-3" />
                            <span className="text-xs">Default</span>
                          </div>
                        ) : (
                          <Badge variant="outline">Custom</Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(cat)}
                          disabled={cat.isDefault}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDelete(cat)}
                          disabled={cat.isDefault}
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
