// import React from "react";

// export default function Dashboard() {
//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100">
//       <div className="bg-white shadow-lg rounded-lg p-8 w-3/4">
//         <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
//         <p className="text-gray-600">Welcome! This is your dashboard.</p>
//       </div>
//     </div>
//   );
// }

//  useEffect(() => {
//     const fetchTransactions = async () => {
//       try {
//         const res = await axiosClient.get("/transactions");
//         setTransactions(res.data.data || []);
//       } catch (err) {
//         console.error("Error fetching transactions:", err);
//       }
//     };
//     fetchTransactions();
//   }, []);

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [instituteFilter, setInstituteFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data.data || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    };
    fetchTransactions();
  }, []);

  // 🔹 Filtering Logic (dynamic includes)
  const filteredTransactions = transactions.filter((txn) => {
    const q = searchQuery.trim().toLowerCase();

    let matchesSearch = true;

    if (q !== "") {
      if (filterBy === "school") {
        matchesSearch = txn.school_id?.toLowerCase().includes(q);
      } else if (filterBy === "student") {
        matchesSearch = txn.student_info?.name?.toLowerCase().includes(q);
      } else if (filterBy === "orderId") {
        matchesSearch = txn.custom_order_id?.toLowerCase().includes(q);
      } else {
        matchesSearch =
          txn.school_id?.toLowerCase().includes(q) ||
          txn.student_info?.name?.toLowerCase().includes(q) ||
          txn.custom_order_id?.toLowerCase().includes(q);
      }
    }

    const matchesStatus =
      !statusFilter || txn.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesInstitute =
      !instituteFilter ||
      txn.school_id?.toLowerCase() === instituteFilter.toLowerCase();

    const matchesDate =
      !dateFilter ||
      new Date(txn.created_at).toISOString().slice(0, 10) === dateFilter;

    return matchesSearch && matchesStatus && matchesInstitute && matchesDate;
  });

  // 🔹 Pagination
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Transactions Dashboard</h1>

      {/* Filters Section */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        {/* Left: Search + Filter By */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 hover:border-gray-500 focus:border-gray-500 rounded-md px-3 py-2 w-72 text-sm focus:ring-2 focus:ring-blue-500 transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="border border-gray-300 hover:border-gray-500 focus:border-gray-500 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="all">Filter By</option>
            <option value="orderId">Order ID</option>
            <option value="student">Student</option>
            <option value="school">School</option>
          </select>
        </div>

        {/* Right: Date, Status, Institute */}
        <div className="flex gap-2">
          <input
            type="date"
            className="border border-gray-300 hover:border-gray-500 focus:border-gray-500 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <select
            className="border border-gray-300 hover:border-gray-500 focus:border-gray-500 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <select
            className="border border-gray-300 hover:border-gray-500 focus:border-gray-500 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition"
            value={instituteFilter}
            onChange={(e) => setInstituteFilter(e.target.value)}
          >
            <option value="">Select Institute</option>
            {[...new Set(transactions.map((t) => t.school_id))].map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rows per page moved under filters left */}
      <div className="flex justify-start mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">Rows per page:</label>
          <select
            className="border border-gray-300 hover:border-gray-500 focus:border-gray-500 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 transition"
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
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow rounded-lg border border-gray-300">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="px-4 py-3 border border-gray-300">Sr.No</th>
              <th className="px-4 py-3 border border-gray-300">Institute Name</th>
              <th className="px-4 py-3 border border-gray-300">Date & Time</th>
              <th className="px-4 py-3 border border-gray-300">Order ID</th>
              <th className="px-4 py-3 border border-gray-300">Order Amt</th>
              <th className="px-4 py-3 border border-gray-300">Transaction Amt</th>
              <th className="px-4 py-3 border border-gray-300">Payment Method</th>
              <th className="px-4 py-3 border border-gray-300">Status</th>
              <th className="px-4 py-3 border border-gray-300">Student Name</th>
              <th className="px-4 py-3 border border-gray-300">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((txn, index) => (
                <tr
                  key={txn._id}
                  className="hover:transform transition ease-in-out duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-lg"
                >
                  <td className="px-4 py-3 border border-gray-200">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 border border-gray-200">{txn.school_id}</td>
                  <td className="px-4 py-3 border border-gray-200">
                    {new Date(txn.created_at).toLocaleString()}
                  </td>
                  {/* <td className="px-4 py-3 border border-gray-200">{txn.custom_order_id}</td> */}
                  <td>
                    <Link to={`/transactions/${txn._id}`} style={{ color: "blue" }}>
                      {txn.custom_order_id}
                    </Link>
                  </td>
                                    
                  <td className="px-4 py-3 border border-gray-200">₹{txn.order_amount}</td>
                  <td className="px-4 py-3 border border-gray-200">₹{txn.transaction_amount}</td>
                  <td className="px-4 py-3 border border-gray-200">{txn.orderStatus?.payment_mode}</td>
                  <td
                    className={`px-4 py-3 border border-gray-200 font-semibold ${
                      txn.status === "success"
                        ? "text-green-600"
                        : txn.status === "failed"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {txn.status}
                  </td>
                  <td className="px-4 py-3 border border-gray-200">{txn.student_info?.name}</td>
                  <td className="px-4 py-3 border border-gray-200">{txn.student_info?.phone || "NA"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-4 text-gray-500">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center mt-4">
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={startIndex + rowsPerPage >= filteredTransactions.length}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}




// import React, { useEffect, useState } from "react";
// import axiosClient from "../api/axiosClient";

// export default function Dashboard() {
//   const [transactions, setTransactions] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [currentPage, setCurrentPage] = useState(1);
//   const rowsPerPage = 10;

//   useEffect(() => {
//     const fetchTransactions = async () => {
//       try {
//         const res = await axiosClient.get("/transactions");
//         setTransactions(res.data.data || []);
//       } catch (err) {
//         console.error("Error fetching transactions:", err);
//       }
//     };
//     fetchTransactions();
//   }, []);

//   // 🔹 Filter transactions
//   const filteredTransactions = transactions.filter((txn) => {
//     const searchMatch =
//       txn.school_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       txn.student_info?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       txn.custom_order_id?.toLowerCase().includes(searchQuery.toLowerCase());

//     const statusMatch =
//       statusFilter === "All" ||
//       txn.status?.toLowerCase() === statusFilter.toLowerCase();

//     return searchMatch && statusMatch;
//   });

//   // 🔹 Pagination logic
//   const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
//   const startIndex = (currentPage - 1) * rowsPerPage;
//   const paginatedTransactions = filteredTransactions.slice(
//     startIndex,
//     startIndex + rowsPerPage
//   );

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Transactions Dashboard</h1>

//       {/* Filters */}
//       <div className="flex flex-wrap gap-4 mb-4">
//         <input
//           type="text"
//           placeholder="Search by Order ID / Student / School"
//           className="form-control w-80 border rounded px-3 py-2"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />

//         <select
//           className="form-control border rounded px-3 py-2"
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//         >
//           <option value="All">All Status</option>
//           <option value="success">Success</option>
//           <option value="failed">Failed</option>
//           <option value="pending">Pending</option>
//         </select>
//       </div>

//       {/* Transactions Table */}
//       <div className="overflow-x-auto shadow rounded-lg border border-gray-200 table-container transition-all duration-300">
//         <table className="min-w-full text-sm text-left">
//           <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
//             <tr>
//               <th className="px-4 py-2">Sr.No</th>
//               <th className="px-4 py-2">Institute Name</th>
//               <th className="px-4 py-2">Date & Time</th>
//               <th className="px-4 py-2">Order ID</th>
//               <th className="px-4 py-2">Order Amt</th>
//               <th className="px-4 py-2">Transaction Amt</th>
//               <th className="px-4 py-2">Payment Method</th>
//               <th className="px-4 py-2">Status</th>
//               <th className="px-4 py-2">Student Name</th>
//               <th className="px-4 py-2">Phone</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {paginatedTransactions.map((txn, index) => (
//               <tr
//                 key={txn._id}
//                 className="hover:bg-gray-50 transition duration-200"
//               >
//                 <td className="px-4 py-2">{startIndex + index + 1}</td>
//                 <td className="px-4 py-2">{txn.school_id}</td>
//                 <td className="px-4 py-2">
//                   {new Date(txn.payment_time).toLocaleString()}
//                 </td>
//                 <td className="px-4 py-2">{txn.custom_order_id}</td>
//                 <td className="px-4 py-2">₹{txn.order_amount}</td>
//                 <td className="px-4 py-2">₹{txn.transaction_amount}</td>
//                 <td className="px-4 py-2">{txn.payment_mode}</td>
//                 <td
//                   className={`px-4 py-2 font-semibold ${
//                     txn.status === "success"
//                       ? "text-green-600"
//                       : txn.status === "failed"
//                       ? "text-red-600"
//                       : "text-yellow-600"
//                   }`}
//                 >
//                   {txn.status}
//                 </td>
//                 <td className="px-4 py-2">{txn.student_info?.name}</td>
//                 <td className="px-4 py-2">{txn.student_info?.phone || "NA"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
//         <p>
//           Showing {startIndex + 1} to{" "}
//           {Math.min(startIndex + rowsPerPage, filteredTransactions.length)} of{" "}
//           {filteredTransactions.length} results
//         </p>
//         <div className="flex space-x-2">
//           <button
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage((prev) => prev - 1)}
//             className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
//           >
//             Prev
//           </button>
//           <button
//             disabled={currentPage === totalPages}
//             onClick={() => setCurrentPage((prev) => prev + 1)}
//             className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



// import React, { useEffect, useState } from "react";
// import axios from "axios";

// export default function Dashboard() {
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [status, setStatus] = useState("");
//   const [search, setSearch] = useState("");
//   const [total, setTotal] = useState(0);

//   useEffect(() => {
//     fetchTransactions();
//   }, [page, status, search]);

//   const fetchTransactions = async () => {
//     const token = localStorage.getItem("token");
//     try {
//       setLoading(true);
//       const res = await axios.get("http://localhost:5000/api/transactions", {
//         headers: { Authorization: `Bearer ${token}` },
//         params: {
//           page,
//           limit: 10,
//           status: status || undefined,
//           search: search || undefined,
//         },
//       });
//       setTransactions(res.data.data);
//       setTotal(res.data.total || res.data.data.length);
//     } catch (err) {
//       console.error("Error fetching transactions:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-4">Transactions Dashboard</h1>

//       {/* Filters */}
//       <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 shadow rounded">
//         <input
//           type="text"
//           placeholder="Search by Order ID / Student / School"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="form-control max-w-xs"
//         />
//         <select
//           value={status}
//           onChange={(e) => setStatus(e.target.value)}
//           className="form-control max-w-xs"
//         >
//           <option value="">All Status</option>
//           <option value="success">Success</option>
//           <option value="pending">Pending</option>
//           <option value="failed">Failed</option>
//         </select>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded shadow overflow-x-auto">
//         {loading ? (
//           <div className="p-6 text-center">Loading...</div>
//         ) : (
//           <div className="table-container">
//               <table className="min-w-full border border-gray-200 rounded-lg">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-4 py-2 border">Sr.No</th>
//                 <th className="px-4 py-2 border">Institute Name</th>
//                 <th className="px-4 py-2 border">Date & Time</th>
//                 <th className="px-4 py-2 border">Order ID</th>
//                 <th className="px-4 py-2 border">Order Amt</th>
//                 <th className="px-4 py-2 border">Transaction Amt</th>
//                 <th className="px-4 py-2 border">Payment Method</th>
//                 <th className="px-4 py-2 border">Status</th>
//                 <th className="px-4 py-2 border">Student Name</th>
//                 <th className="px-4 py-2 border">Phone</th>
//               </tr>
//             </thead>
//             <tbody>
//               {transactions.length > 0 ? (
//                 transactions.map((txn, idx) => (
//                   <tr key={txn._id} className="hover:bg-gray-50">
//                     <td className="px-4 py-2 border">{(page - 1) * 10 + idx + 1}</td>
//                     <td className="px-4 py-2 border">{txn.school_id}</td>
//                     <td className="px-4 py-2 border">
//                       {new Date(txn.created_at).toLocaleString()}
//                     </td>
//                     <td className="px-4 py-2 border">{txn.custom_order_id}</td>
//                     <td className="px-4 py-2 border">₹{txn.order_amount}</td>
//                     <td className="px-4 py-2 border">₹{txn.transaction_amount}</td>
//                     <td className="px-4 py-2 border">{txn.orderStatus.payment_mode}</td>
//                     <td
//                       className={`px-4 py-2 border font-semibold ${
//                         txn.status === "success"
//                           ? "text-green-600"
//                           : txn.status === "pending"
//                           ? "text-yellow-500"
//                           : "text-red-600"
//                       }`}
//                     >
//                       {txn.status}
//                     </td>
//                     <td className="px-4 py-2 border">{txn.student_info?.name}</td>
//                     <td className="px-4 py-2">{txn.student_info?.phone || "NA"}</td>

//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="9" className="text-center py-4 text-gray-500">
//                     No transactions found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       <div className="flex justify-between items-center mt-4">
//         <span className="text-sm text-gray-600">
//           Showing {transactions.length} of {total} results
//         </span>
//         <div className="flex gap-2">
//           <button
//             disabled={page === 1}
//             onClick={() => setPage((p) => p - 1)}
//             className="btn-primary disabled:opacity-50"
//           >
//             Prev
//           </button>
//           <button
//             disabled={transactions.length < 10}
//             onClick={() => setPage((p) => p + 1)}
//             className="btn-primary disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
