// src/pages/CreatePayment.jsx
import React, { useState } from "react";
import axiosClient from "../api/axiosClient";

export default function CreatePayment() {
  const [form, setForm] = useState({
    name: "",
    studentId: "",
    email: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        student_info: {
          name: form.name,
          id: form.studentId,
          email: form.email,
        },
        order_amount: Number(form.amount),
        custom_order_id: `CUST-${Date.now()}`, // unique ID
      };

      // ✅ Call backend to create collect request
      const res = await axiosClient.post("/payment/create-payment", payload);

      if (res.data.payment_url) {
        // redirect user to gateway
        window.location.href = res.data.payment_url;
      } else {
        setError("Payment URL not received from server");
      }
    } catch (err) {
      console.error("Payment creation error:", err);
      setError("Failed to create payment request");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Payment</h1>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Student Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Student ID</label>
            <input
              type="text"
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="STU123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="student@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
              min="1"
              className="form-control"
              placeholder="1000"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Creating..." : "Proceed to Pay"}
          </button>
        </form>
      </div>
    </div>
  );
}
