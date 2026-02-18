import { useEffect, useState } from "react";
import supabase from "@/utils/supabase-browser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HostPaymentRow {
  payment_id: number;
  payment_date: string;
  amount: number;
  payment_method: string;
  status: string;
  booking_ids: number;
  transaction_id: string | null;
}

export default function HostFinancialsPage() {
  const [rows, setRows] = useState<HostPaymentRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<HostPaymentRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      const { data: userId, error: userErr } =
        await supabase.rpc("auth_user_id");
      if (userErr || typeof userId !== "number") return;

      const hostHotelIds =
        (
          await supabase.from("hotels").select("hotel_id").eq("host_id", userId)
        ).data?.map((h) => h.hotel_id) ?? [];

      const bookingIds =
        (
          await supabase
            .from("bookings")
            .select("booking_id")
            .in("hotel_id", hostHotelIds)
        ).data?.map((b) => b.booking_id) ?? [];

      const { data, error } = await supabase
        .from("payments")
        .select(
          "payment_id, payment_date, amount, payment_method, status, transaction_id, booking_id",
        )
        .in("booking_id", bookingIds)
        .order('payment_date', { ascending: false });

      if (error || !data) {
        console.error(error);
        return;
      }

      const paymentRows = data.map((row) => ({
        payment_id: row.payment_id,
        payment_date: row.payment_date,
        amount: row.amount,
        payment_method: row.payment_method ?? "demo",
        status: row.status,
        booking_ids : row.booking_id,
        transaction_id: row.transaction_id,
      }));

      setRows(paymentRows);
      setFilteredRows(paymentRows);
    }

    void load();
  }, []);

  // Filter payments when filters change
  useEffect(() => {
    let filtered = rows;

    if (statusFilter !== "all") {
      filtered = filtered.filter(row => row.status === statusFilter);
    }

    setFilteredRows(filtered);
  }, [rows, statusFilter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Financials</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Payment history for your bookings.
        </p>
      </div>

      <Card className="mb-6 ">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Payment Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Total payments
            </p>
            <p className="text-lg font-semibold">{filteredRows.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Completed revenue
            </p>
            <p className="text-lg font-semibold">
              {filteredRows
                .filter((row) => row.status === "completed")
                .reduce((sum, row) => sum + row.amount, 0)
                .toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Total revenue (all statuses)
            </p>
            <p className="text-lg font-semibold">
              {filteredRows
                .reduce((sum, row) => sum + row.amount, 0)
                .toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                })}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-lg border bg-[hsl(var(--card))]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm font-medium">Booking ID</TableHead>
              <TableHead>Transaction</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-[hsl(var(--muted-foreground))]"
                >
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <TableRow key={row.payment_id}>
                  <TableCell>{row.booking_ids}</TableCell>
                  <TableCell className="text-sm font-medium">
                    {row.transaction_id ?? `#${row.payment_id}`}
                  </TableCell>
                  <TableCell className="text-sm">{row.payment_date}</TableCell>
                  <TableCell className="text-sm font-medium">
                    {row.amount.toLocaleString(undefined, {
                      style: "currency",
                      currency: "USD",
                    })}
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.payment_method || "demo"}
                  </TableCell>
                  <TableCell className="text-sm capitalize">
                    {row.status}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
