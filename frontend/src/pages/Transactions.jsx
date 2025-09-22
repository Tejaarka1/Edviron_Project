import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Select, { components } from "react-select";

const MultiValueContainer = (props) => {
  const { index } = props;
  const getValue = props.getValue || props.selectProps?.getValue;

  if (!getValue) return <components.MultiValueContainer {...props} />;

  const maxToShow = 2;
  const overflow = getValue().length - maxToShow;

  if (index < maxToShow) {
    return <components.MultiValueContainer {...props} />;
  }
  if (index === maxToShow) {
    return (
      <div
        style={{
          padding: "2px 6px",
          marginLeft: "4px",
          background: "#e5e7eb",
          borderRadius: "12px",
          fontSize: "12px",
        }}
      >
        +{overflow}
      </div>
    );
  }
  return null;
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [schoolFilter, setSchoolFilter] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();
  const location = useLocation();

  const statusOptions = [
    { value: "success", label: "Success" },
    { value: "failed", label: "Failed" },
    { value: "pending", label: "Pending" },
  ];

  const [schoolOptions, setSchoolOptions] = useState([]);

  // ✅ Fetch data + build school options
  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data.data || []);

        const uniqueSchools = [...new Set(res.data.data.map((t) => t.school_id))];
        setSchoolOptions(uniqueSchools.map((s) => ({ value: s, label: s }))); // 🔥 keep original casing
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    };
    fetchTransactions();
  }, []);

  // ✅ Load filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const search = params.get("search") || "";
    const statuses = params.get("status")?.split(",").filter(Boolean) || [];
    const schools = params.get("schools")?.split(",").filter(Boolean) || [];
    const start = params.get("startDate") || "";
    const end = params.get("endDate") || "";

    setSearchQuery(search);
    setStatusFilter(statuses.map((s) => statusOptions.find((opt) => opt.value === s)).filter(Boolean));
    setSchoolFilter(schools.map((s) => ({ value: s, label: s })));
    setDateRange({ start, end });
  }, [location.search]);

  // ✅ Update URL whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("search", searchQuery);
    if (statusFilter.length > 0) params.set("status", statusFilter.map((s) => s.value).join(","));
    if (schoolFilter.length > 0) params.set("schools", schoolFilter.map((s) => s.value).join(","));
    if (dateRange.start) params.set("startDate", dateRange.start);
    if (dateRange.end) params.set("endDate", dateRange.end);

    navigate({ search: params.toString() }, { replace: true });
  }, [searchQuery, statusFilter, schoolFilter, dateRange, navigate]);

  // ✅ Filtering logic
  const filteredTransactions = transactions.filter((txn) => {
    const q = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !q ||
      txn.custom_order_id?.toLowerCase().includes(q) ||
      txn.collect_id?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter.length === 0 ||
      statusFilter.some((s) => txn.status?.toLowerCase() === s.value);

    const matchesSchool =
      schoolFilter.length === 0 ||
      schoolFilter.some((s) => txn.school_id === s.value); // 🔥 fixed casing issue

    const matchesDate =
      (!dateRange.start || new Date(txn.created_at) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(txn.created_at) <= new Date(dateRange.end));

    return matchesSearch && matchesStatus && matchesSchool && matchesDate;
  });

  // ✅ Pagination
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + rowsPerPage);

  // ✅ Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter([]);
    setSchoolFilter([]);
    setDateRange({ start: "", end: "" });
    setPage(1);
    navigate({ search: "" }, { replace: true });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by Order ID or Collect ID..."
          className="border rounded px-3 py-2 w-72 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select
          isMulti
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Select statuses"
          components={{ MultiValueContainer }}
          className="w-60"
        />

        <Select
          isMulti
          options={schoolOptions}
          value={schoolFilter}
          onChange={setSchoolFilter}
          placeholder="Select schools"
          components={{ MultiValueContainer }}
          className="w-60"
        />

        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
          className="border rounded px-2 py-1 text-sm"
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
          className="border rounded px-2 py-1 text-sm"
        />

        <button onClick={() => setPage(1)} className="px-4 py-2 bg-blue-600 text-white rounded">
          Apply Filters
        </button>
        <button onClick={resetFilters} className="px-4 py-2 bg-gray-300 rounded">
          Reset
        </button>

        <select
          className="border rounded px-2 py-1 text-sm"
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(1);
          }}
        >
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
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((txn, index) => (
                <tr key={txn._id}>
                  <td className="px-4 py-3 border">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 border">{txn.collect_id}</td>
                  <td className="px-4 py-3 border">{txn.school_id}</td>
                  <td className="px-4 py-3 border">{txn.gateway}</td>
                  <td className="px-4 py-3 border">₹{txn.order_amount}</td>
                  <td className="px-4 py-3 border">₹{txn.transaction_amount}</td>
                  <td
                    className={`px-4 py-3 border font-semibold ${
                      txn.status === "success"
                        ? "text-green-600"
                        : txn.status === "failed"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {txn.status}
                  </td>
                  <td className="px-4 py-3 border">
                    <Link to={`/transactions/${txn._id}`} className="text-blue-600">
                      {txn.custom_order_id}
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-4 gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <button
          disabled={startIndex + rowsPerPage >= filteredTransactions.length}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
