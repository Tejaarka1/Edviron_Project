// src/pages/SchoolTransactions.jsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Link } from "react-router-dom";
import { fetchTransactionsBySchool } from "../api/transactionApi";

export default function SchoolTransactions() {
  const [schoolId, setSchoolId] = useState(null);
  const [schools, setSchools] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Load school list (could come from backend or unique from transactions)
    // For now we fake it or fetch all transactions once.
    async function loadSchools() {
      try {
        const res = await fetchTransactionsBySchool("dummy"); // backend could have an endpoint for schools
        // fallback: from res.data extract school_ids
      } catch {
        // fallback static
        setSchools([
          { value: "SCHOOL_A", label: "SCHOOL_A" },
          { value: "SCHOOL_B", label: "SCHOOL_B" },
          { value: "SCHOOL_C", label: "SCHOOL_C" },
        ]);
      }
    }
    loadSchools();
  }, []);

  const handleFetch = async () => {
    if (!schoolId) return;
    const res = await fetchTransactionsBySchool(schoolId.value);
    setTransactions(res.data || []);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 className="text-2xl font-bold mb-4">Transactions by School</h1>

      {/* School Selector */}
      <div className="flex items-center gap-3 mb-4">
        <Select
          options={schools}
          value={schoolId}
          onChange={setSchoolId}
          placeholder="Select a school"
          className="w-64"
        />
        <button
          onClick={handleFetch}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Load Transactions
        </button>
      </div>

      {/* Table */}
      {transactions.length > 0 ? (
        <div className="overflow-x-auto border rounded shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
              <tr>
                <th className="px-4 py-3 border">Order ID</th>
                <th className="px-4 py-3 border">Collect ID</th>
                <th className="px-4 py-3 border">Gateway</th>
                <th className="px-4 py-3 border">Amount</th>
                <th className="px-4 py-3 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn._id}>
                  <td className="px-4 py-3 border">
                    <Link to={`/transactions/${txn._id}`} className="text-blue-600">
                      {txn.custom_order_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 border">{txn.collect_id}</td>
                  <td className="px-4 py-3 border">{txn.gateway}</td>
                  <td className="px-4 py-3 border">₹{txn.transaction_amount}</td>
                  <td className="px-4 py-3 border">{txn.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No transactions found</p>
      )}
    </div>
  );
}
