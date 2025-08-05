import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTx() {
      setLoading(true);
      try {
        const res = await api.get("/transactions");
        console.log("res: ", res);
        setTransactions(res.data.data?.recentTransactions || res.data);
        setError(null);
      } catch (err) {
        console.error("Fetch Transactions Error:", err);
        setError("Could not fetch transactions");
      } finally {
        setLoading(false);
      }
    }
    fetchTx();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!transactions.length) return <div>No transactions found</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 10).map((trx) => (
              <tr key={trx._id}>
                <td>{new Date(trx.date).toLocaleDateString()}</td>
                <td>{trx.category?.name || "—"}</td>
                <td>{trx.amount}</td>
                <td>{trx.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
