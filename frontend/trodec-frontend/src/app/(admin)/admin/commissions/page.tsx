"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, DollarSign, Users, Clock, CheckCircle, ArrowDownToLine, X } from "lucide-react";
import { toast } from "sonner";
import {
  getAllCommissions, markCommissionPaid, getAllWithdrawals, processWithdrawal,
  Commission, WithdrawalRequest, PlatformStats,
} from "@/services/commission.service";

const commissionStatusColor: Record<string, string> = {
  pending: "border-yellow-500/30 text-yellow-400 bg-yellow-500/5",
  reserved: "border-blue-500/30 text-blue-400 bg-blue-500/5",
  paid: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
  reversed: "border-red-500/30 text-red-400 bg-red-500/5",
};

const withdrawalStatusColor: Record<string, string> = {
  pending: "border-yellow-500/30 text-yellow-400 bg-yellow-500/5",
  approved: "border-blue-500/30 text-blue-400 bg-blue-500/5",
  paid: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
  rejected: "border-red-500/30 text-red-400 bg-red-500/5",
};

export default function AdminCommissionsPage() {
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"commissions" | "withdrawals">("commissions");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Rejection modal
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Pay modal
  const [payModal, setPayModal] = useState<{ id: string; type: "commission" | "withdrawal" } | null>(null);
  const [txRef, setTxRef] = useState("");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [commissionsRes, withdrawalsRes] = await Promise.all([
        getAllCommissions({ limit: 100 }),
        getAllWithdrawals({ limit: 100 }),
      ]);
      setPlatformStats(commissionsRes.platformStats);
      setCommissions(commissionsRes.data);
      setWithdrawals(withdrawalsRes.data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load commissions");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkPaid(commissionId: string) {
    try {
      setProcessingId(commissionId);
      const updated = await markCommissionPaid(commissionId);
      setCommissions(prev => prev.map(c => c.id === commissionId ? updated : c));
      toast.success("Commission marked as paid");
      setPayModal(null);
      setTxRef("");
    } catch (e: any) {
      toast.error(e.message || "Failed to update commission");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleWithdrawalAction(id: string, action: "approved" | "paid" | "rejected") {
    try {
      setProcessingId(id);
      const updated = await processWithdrawal(id, action, {
        transactionRef: txRef || undefined,
        rejectionReason: rejectReason || undefined,
      });
      setWithdrawals(prev => prev.map(w => w.id === id ? updated : w));
      toast.success(`Withdrawal ${action}`);
      setPayModal(null);
      setRejectModal(null);
      setTxRef("");
      setRejectReason("");
    } catch (e: any) {
      toast.error(e.message || "Failed to process withdrawal");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
    </div>
  );

  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending").length;

  return (
    <div className="space-y-8 text-white max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Commissions</h1>
          <p className="text-zinc-500 mt-1">Platform revenue and expert payouts</p>
        </div>
        {pendingWithdrawals > 0 && (
          <button onClick={() => setActiveTab("withdrawals")}
            className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm px-4 py-2 rounded-lg hover:bg-yellow-500/20 transition">
            <ArrowDownToLine className="w-4 h-4" />
            {pendingWithdrawals} pending withdrawal{pendingWithdrawals > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Revenue", value: platformStats?.totalRevenue ?? 0, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Platform Margin", value: platformStats?.totalPlatformMargin ?? 0, icon: DollarSign, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Expert Payouts", value: platformStats?.totalExpertPayouts ?? 0, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Available", value: platformStats?.pendingPayouts ?? 0, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "In Withdrawal", value: platformStats?.inWithdrawal ?? 0, icon: ArrowDownToLine, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Paid Out", value: platformStats?.paidPayouts ?? 0, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map(stat => (
          <Card key={stat.label} className="bg-[#0b0b0b] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-xs text-zinc-500">{stat.label}</p>
              <p className="text-xl font-bold mt-0.5">₹{Number(stat.value).toFixed(2)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-1 w-fit">
        {(["commissions", "withdrawals"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}>
            {tab}
            {tab === "withdrawals" && pendingWithdrawals > 0 && (
              <span className="ml-2 bg-yellow-500 text-black text-xs rounded-full px-1.5 py-0.5">{pendingWithdrawals}</span>
            )}
          </button>
        ))}
      </div>

      {/* Commissions tab */}
      {activeTab === "commissions" && (
        <div className="space-y-3">
          {commissions.length === 0 ? (
            <Card className="bg-[#0b0b0b] border-[#1a1a1a]">
              <CardContent className="py-16 text-center text-zinc-500">
                <TrendingUp className="h-10 w-10 mx-auto mb-3 text-zinc-700" />
                <p>No commissions yet.</p>
              </CardContent>
            </Card>
          ) : commissions.map(c => (
            <Card key={c.id} className="bg-[#0b0b0b] border-[#1a1a1a]">
              <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Order #{c.orderId.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-zinc-500">
                    Order: ₹{Number(c.orderAmount).toFixed(2)} ·
                    Commission: ₹{Number(c.totalCommission).toFixed(2)} ·
                    Expert: ₹{Number(c.expertPayout).toFixed(2)} ·
                    Platform: ₹{Number(c.platformMargin).toFixed(2)}
                  </p>
                  <p className="text-xs text-zinc-600">{new Date(c.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`capitalize ${commissionStatusColor[c.status]}`}>
                    {c.status === "reserved" ? "in withdrawal" : c.status}
                  </Badge>
                  {c.status === "pending" && (
                    <Button size="sm" onClick={() => setPayModal({ id: c.id, type: "commission" })}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
                      Mark Paid
                    </Button>
                  )}
                  {c.status === "reserved" && (
                    <span className="text-xs text-zinc-500">Pay via Withdrawals tab</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Withdrawals tab */}
      {activeTab === "withdrawals" && (
        <div className="space-y-3">
          {withdrawals.length === 0 ? (
            <Card className="bg-[#0b0b0b] border-[#1a1a1a]">
              <CardContent className="py-16 text-center text-zinc-500">
                <ArrowDownToLine className="h-10 w-10 mx-auto mb-3 text-zinc-700" />
                <p>No withdrawal requests yet.</p>
              </CardContent>
            </Card>
          ) : withdrawals.map(w => (
            <Card key={w.id} className="bg-[#0b0b0b] border-[#1a1a1a]">
              <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">₹{Number(w.amount).toFixed(2)}</p>
                    {w.expert && <span className="text-xs text-zinc-400">by {w.expert.fullName ?? w.expert.email}</span>}
                  </div>
                  {w.bankAccount && (
                    <p className="text-xs text-zinc-500">{w.bankAccount.bankName} ••••{w.bankAccount.accountNumber.slice(-4)}{w.bankAccount.upiId ? ` · UPI: ${w.bankAccount.upiId}` : ""}</p>
                  )}
                  <p className="text-xs text-zinc-600">{new Date(w.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</p>
                  {w.rejectionReason && <p className="text-xs text-red-400">Rejected: {w.rejectionReason}</p>}
                  {w.transactionRef && <p className="text-xs text-zinc-400">Ref: {w.transactionRef}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`capitalize ${withdrawalStatusColor[w.status]}`}>{w.status}</Badge>
                  {w.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => handleWithdrawalAction(w.id, "approved")}
                        disabled={processingId === w.id}
                        className="h-7 text-xs bg-blue-600 hover:bg-blue-500 text-white">
                        {processingId === w.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setRejectModal({ id: w.id }); }}
                        className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10">
                        Reject
                      </Button>
                    </>
                  )}
                  {w.status === "approved" && (
                    <Button size="sm" onClick={() => setPayModal({ id: w.id, type: "withdrawal" })}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
                      Mark Paid
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mark Paid modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#0f0f0f] border-[#1a1a1a] w-full max-w-md">
            <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-white text-lg">Mark as Paid</CardTitle>
              <button onClick={() => { setPayModal(null); setTxRef(""); }} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Transaction Reference (optional)</label>
                <input value={txRef} onChange={e => setTxRef(e.target.value)} placeholder="UTR / Transaction ID"
                  className="w-full bg-[#111] border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => { setPayModal(null); setTxRef(""); }} className="border-zinc-700">Cancel</Button>
                <Button onClick={() => payModal.type === "commission" ? handleMarkPaid(payModal.id) : handleWithdrawalAction(payModal.id, "paid")}
                  disabled={processingId === payModal.id}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  {processingId === payModal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Payment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="bg-[#0f0f0f] border-[#1a1a1a] w-full max-w-md">
            <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-white text-lg">Reject Withdrawal</CardTitle>
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Reason for rejection</label>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Invalid bank details"
                  className="w-full bg-[#111] border border-zinc-700 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-h-20 resize-none" />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => { setRejectModal(null); setRejectReason(""); }} className="border-zinc-700">Cancel</Button>
                <Button onClick={() => handleWithdrawalAction(rejectModal.id, "rejected")}
                  disabled={processingId === rejectModal.id}
                  className="bg-red-600 hover:bg-red-500 text-white">
                  {processingId === rejectModal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
