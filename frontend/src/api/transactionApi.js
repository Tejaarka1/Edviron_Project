// src/api/transactionApi.js
import axiosClient from "./axiosClient";

export const fetchTransactions = async (params = {}) => {
  const res = await axiosClient.get("/transactions", { params });
  return res.data;
};

export const fetchTransactionById = async (id) => {
  const res = await axiosClient.get(`/transactions/${id}`);
  return res.data;
};

export const fetchTransactionsBySchool = async (schoolId, params = {}) => {
  const res = await axiosClient.get(`/transactions/school/${encodeURIComponent(schoolId)}`, { params });
  return res.data;
};

export const checkTransactionStatus = async (id) => {
  const res = await axiosClient.get(`/transaction-status/${encodeURIComponent(id)}`);
  return res.data;
};
