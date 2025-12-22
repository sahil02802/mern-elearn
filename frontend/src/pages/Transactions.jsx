import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import {
	Download,
	Printer,
	Search,
	Calendar,
	DollarSign,
	Clock,
	FileText
} from "lucide-react";
import { motion } from "framer-motion";

import API from "../api";
import { authHeader, getCurrentUser, getToken } from "../auth";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";

export default function Transactions() {
	const token = getToken();
	const user = getCurrentUser();
	const [loading, setLoading] = useState(true);
	const [transactions, setTransactions] = useState([]);
	const [filters, setFilters] = useState({ from: "", to: "" });

	useEffect(() => {
		if (!token) return;
		API.get("/purchases/me", { headers: authHeader() })
			.then((res) => setTransactions(res.data))
			.finally(() => setLoading(false));
	}, [token]);

	const filtered = useMemo(() => {
		return transactions.filter((t) => {
			const date = new Date(t.createdAt);
			if (filters.from && date < new Date(filters.from)) return false;
			if (filters.to) {
				const to = new Date(filters.to);
				to.setHours(23, 59, 59, 999);
				if (date > to) return false;
			}
			return true;
		});
	}, [transactions, filters]);

	function updateFilter(e) {
		setFilters({ ...filters, [e.target.name]: e.target.value });
	}

	function downloadCsv() {
		if (!filtered.length) return;
		const rows = [
			["Date", "Course", "Amount", "Status"].join(","),
			...filtered.map((t) => {
				const course = t.course;
				return [
					new Date(t.createdAt).toLocaleString(),
					course?.title || "N/A",
					course ? `₹${course.price}` : "",
					t.status,
				]
					.map((cell) => `"${cell ?? ""}"`)
					.join(",");
			}),
		].join("\n");
		const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "transactions.csv";
		link.click();
		URL.revokeObjectURL(url);
	}

	function printTable() {
		const rows = filtered
			.map((t) => {
				const course = t.course;
				return `<tr>
          <td>${new Date(t.createdAt).toLocaleString()}</td>
          <td>${course?.title || "N/A"}</td>
          <td>${course ? `₹${course.price}` : "—"}</td>
          <td>${t.status}</td>
        </tr>`;
			})
			.join("");
		const win = window.open("", "_blank");
		win.document.write(`
      <html>
        <head>
          <title>Transaction History</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 32px; color: #1e293b; }
            h2 { margin-bottom: 24px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background: #f8fafc; font-weight: 600; color: #475569; }
            tr:nth-child(even) { background: #fcfcfc; }
          </style>
        </head>
        <body>
          <h2>Transaction History</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
		win.document.close();
		win.focus();
		win.print();
		win.close();
	}

	if (!token || !user || user.role !== "user") {
		return <Navigate to="/login" replace />;
	}

	return (
		<div className="space-y-6">
			<motion.header
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				className="space-y-2 border-b border-white/5 pb-6"
			>
				<h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
					<FileText className="text-brand-400" /> Transactions
				</h1>
				<p className="text-ink-400 max-w-2xl">
					Manage and export your detailed purchase history.
				</p>
			</motion.header>

      <Card className="p-6 border border-white/5 bg-surface/50">
				<div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
					<div className="grid grid-cols-2 gap-4 w-full md:w-auto">
						<div>
							<label className="text-xs font-semibold text-ink-400 mb-1 block">From Date</label>
							<Input
								type="date"
								name="from"
								value={filters.from}
								onChange={updateFilter}
								className="bg-canvas border-white/10"
							/>
						</div>
						<div>
							<label className="text-xs font-semibold text-ink-400 mb-1 block">To Date</label>
							<Input
								type="date"
								name="to"
								value={filters.to}
								onChange={updateFilter}
								className="bg-canvas border-white/10"
							/>
						</div>
					</div>

          <div className="ml-auto flex gap-2 w-full md:w-auto">
						<Button
							variant="secondary"
							onClick={downloadCsv}
							disabled={!filtered.length}
							className="flex-1 md:flex-none"
						>
							<Download size={16} className="mr-2" /> CSV
						</Button>
						<Button
							variant="primary"
							onClick={printTable}
							disabled={!filtered.length}
							className="flex-1 md:flex-none"
						>
							<Printer size={16} className="mr-2" /> Print
						</Button>
					</div>
				</div>

        <div className="table-shell rounded-xl border border-white/5 bg-canvas/30">
					<table className="w-full text-left text-sm text-ink-400">
						<thead className="bg-surfaceHighlight/50 text-white font-medium uppercase text-xs tracking-wider">
							<tr>
								<th className="px-6 py-4">Date & Time</th>
								<th className="px-6 py-4">Course</th>
								<th className="px-6 py-4">Amount</th>
								<th className="px-6 py-4">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/5">
							{loading ? (
								<tr>
									<td colSpan="4" className="px-6 py-8 text-center">
										<div className="flex items-center justify-center gap-2 text-brand-400">
											<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
											Loading transactions...
										</div>
									</td>
								</tr>
							) : filtered.length ? (
								filtered.map((t) => (
									<tr key={t._id} className="hover:bg-white/5 transition-colors">
										<td className="px-6 py-4 flex items-center gap-2">
											<Calendar size={14} className="text-ink-600" />
											{new Date(t.createdAt).toLocaleDateString()}
											<span className="text-xs text-ink-600 ml-1">
												{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
											</span>
										</td>
										<td className="px-6 py-4 font-medium text-white">
											{t.course?.title || <span className="text-ink-600 italic">Course Removed</span>}
										</td>
										<td className="px-6 py-4 text-emerald-400 font-mono">
											{t.course ? `₹${t.course.price}` : "—"}
										</td>
										<td className="px-6 py-4">
											<Badge variant={t.status === "completed" ? "success" : "warning"}>
												{t.status}
											</Badge>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan="4"
										className="px-6 py-8 text-center text-ink-500 italic"
									>
										No transactions found for the selected range.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
}
