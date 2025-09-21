// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import Login from "../pages/Login";
// import Dashboard from "../pages/Dashboard";

// export default function AppRoutes() {   // 👈 this must be "default"
//   return (
//     <Routes>
//       <Route path="/" element={<Login />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/dashboard" element={<Dashboard />} />
//     </Routes>
//   );
// }


// inside <Routes>

import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Transactions from "../pages/Transactions";
import TransactionDetails from "../pages/TransactionDetails";
// import TransactionDetails from "../pages/TransactionDetails";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/transactions/:id" element={<TransactionDetails />} />
      {/* <Route path="/" element={<Dashboard />} /> */}
      {/* <Route path="/transactions/:id" element={<TransactionDetails />} /> */}
    </Routes>
  );
}
