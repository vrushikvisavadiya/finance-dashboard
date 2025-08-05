import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { QueryLoader } from "@/components/QueryLoader";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

/* ─────────── fetcher ──────────── */
const getRecent = () =>
  api.get("/analytics/recent-transactions?limit=10").then((res) => {
    const arr = res.data?.data?.recentTransactions;
    return Array.isArray(arr) ? arr : [];
  });

export default function RecentTransactions() {
  const query = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: getRecent,
    staleTime: 60_000,
  });

  return (
    <QueryLoader query={query}>
      {(txns) => (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            {txns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No transactions yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txns.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell>
                        {format(new Date(t.date), "dd MMM")}
                      </TableCell>
                      <TableCell>{t.category?.name ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        {t.type === "expense" ? "-" : ""}
                        {t.amount.toLocaleString("en-IN")}
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
