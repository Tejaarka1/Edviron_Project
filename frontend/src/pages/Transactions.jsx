// src/pages/Transactions.jsx
import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import axiosClient from "../api/axiosClient";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]); // array of {value,label}
  const [schoolFilter, setSchoolFilter] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const statusOptions = [
    { value: "success", label: "Success" },
    { value: "failed", label: "Failed" },
    { value: "initiated", label: "Initiated" },
    { value: "pending", label: "Pending" },
  ];

  useEffect(() => {
    fetchInitial();
  }, []);

  // fetch all (or first N) transactions from backend
  const fetchInitial = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/transactions", { params: { limit: 1000 } });
      const data = res.data.data || [];
      setTransactions(data);

      const uniqueSchools = Array.from(new Set(data.map((d) => d.school_id).filter(Boolean))).map((s) => ({ value: s, label: s }));
      setSchoolOptions(uniqueSchools);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters locally (we fetched up to limit on load)
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions.filter((txn) => {
      const matchesSearch =
        !q ||
        (txn.custom_order_id && txn.custom_order_id.toLowerCase().includes(q)) ||
        (txn.collect_id && String(txn.collect_id).toLowerCase().includes(q)) ||
        (txn.student_name && txn.student_name.toLowerCase().includes(q));
      const matchesStatus = statusFilter.length === 0 || statusFilter.some((s) => (txn.status || "initiated") === s.value);
      const matchesSchool = schoolFilter.length === 0 || schoolFilter.some((s) => txn.school_id === s.value);
      const matchesDate =
        (!dateRange.start || new Date(txn.payment_time || txn.created_at) >= new Date(dateRange.start)) &&
        (!dateRange.end || new Date(txn.payment_time || txn.created_at) <= new Date(dateRange.end));
      return matchesSearch && matchesStatus && matchesSchool && matchesDate;
    });
  }, [transactions, searchQuery, statusFilter, schoolFilter, dateRange]);

  const startIndex = (page - 1) * rowsPerPage;
  const pageData = filtered.slice(startIndex, startIndex + rowsPerPage);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter([]);
    setSchoolFilter([]);
    setDateRange({ start: "", end: "" });
    setPage(1);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by Order ID or Collect ID or student..."
          className="border rounded px-3 py-2 w-72 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select isMulti options={statusOptions} value={statusFilter} onChange={setStatusFilter} placeholder="Select statuses" className="w-60" />

        <Select isMulti options={schoolOptions} value={schoolFilter} onChange={setSchoolFilter} placeholder="Select schools" className="w-60" />

        <input type="date" value={dateRange.start} onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
        <input type="date" value={dateRange.end} onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))} className="border rounded px-2 py-1 text-sm" />

        <button onClick={() => setPage(1)} className="px-4 py-2 bg-blue-600 text-white rounded">
          Apply Filters
        </button>
        <button onClick={resetFilters} className="px-4 py-2 bg-gray-300 rounded">
          Reset
        </button>

        <select className="border rounded px-2 py-1 text-sm" value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow rounded-lg border border-gray-300">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="px-4 py-3 border">Sr.No</th>
              <th className="px-4 py-3 border">Collect ID</th>
              <th className="px-4 py-3 border">School</th>
              <th className="px-4 py-3 border">Gateway</th>
              <th className="px-4 py-3 border">Order Amount</th>
              <th className="px-4 py-3 border">Transaction Amount</th>
              <th className="px-4 py-3 border">Status</th>
              <th className="px-4 py-3 border">Order ID</th>
              <th className="px-4 py-3 border">Student Name</th>
              <th className="px-4 py-3 border">Student ID</th>
              <th className="px-4 py-3 border">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pageData.length > 0 ? (
              pageData.map((txn, index) => (
                <tr key={txn.collect_id || txn.custom_order_id || index}>
                  <td className="px-4 py-3 border">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 border">{txn.collect_id}</td>
                  <td className="px-4 py-3 border">{txn.school_id}</td>
                  {/* <td className="px-4 py-3 border">{txn.gateway}</td> */}
                  <td className="px-4 py-3 border">{txn.gateway || "Sandbox"}</td>
                  <td className="px-4 py-3 border">₹{txn.order_amount || "-"}</td>
                  {/* <td className="px-4 py-3 border">₹{txn.transaction_amount || "-"}</td> */}
                  <td className="px-4 py-3 border">
                  {txn.transaction_amount && txn.transaction_amount !== "N/A"
                    ? `₹${txn.transaction_amount}`
                    : "N/A"}
                </td>
                  <td className={`px-4 py-3 border font-semibold ${txn.status === "success" ? "text-green-600" : txn.status === "failed" ? "text-red-600" : "text-yellow-600"}`}>
                    {txn.status || "initiated"}
                  </td>
                  <td className="px-4 py-3 border">{txn.custom_order_id}</td>
                  <td className="px-4 py-3 border">{txn.student_name || "-"}</td>
                  <td className="px-4 py-3 border">{txn.student_id || "-"}</td>
                  <td className="px-4 py-3 border">{txn.student_email || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center py-4 text-gray-500">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-4 gap-2">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50">
          Prev
        </button>
        <button disabled={startIndex + rowsPerPage >= filtered.length} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">
          Next
        </button>
      </div>
    </div>
  );
}
