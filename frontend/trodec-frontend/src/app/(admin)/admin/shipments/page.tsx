"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, Truck, ExternalLink, Upload, Download, RefreshCw, FileText, ClipboardList, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  getAdminShipments, uploadShipmentLabel,
  retryShipmentAwb, retryShipmentDocuments,
  AdminShipmentRow, PaginatedResult,
} from "@/services/admin.service";

const STATUS_STYLES: Record<string, string> = {
  PENDING:          "bg-amber-500/10 text-amber-400",
  SHIPPED:          "bg-blue-500/10 text-blue-400",
  IN_TRANSIT:       "bg-cyan-500/10 text-cyan-400",
  OUT_FOR_DELIVERY: "bg-purple-500/10 text-purple-400",
  DELIVERED:        "bg-emerald-500/10 text-emerald-400",
  RETURNED:         "bg-orange-500/10 text-orange-400",
  RTO:              "bg-red-500/10 text-red-400",
};

export default function AdminShipmentsPage() {
  const [data, setData] = useState<PaginatedResult<AdminShipmentRow> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingShipmentId = useRef<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getAdminShipments({ status: statusFilter || undefined });
      setData(result);
    } catch {
      toast.error("Failed to load shipments");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  function handleUploadClick(shipmentId: string) {
    pendingShipmentId.current = shipmentId;
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const shipmentId = pendingShipmentId.current;
    if (!file || !shipmentId) return;
    e.target.value = "";
    try {
      setUploadingId(shipmentId);
      const { labelUrl } = await uploadShipmentLabel(shipmentId, file);
      setData((prev) => prev ? {
        ...prev,
        data: prev.data.map((s) => s.id === shipmentId ? { ...s, label_url: labelUrl } : s),
      } : prev);
      toast.success("Label uploaded successfully");
    } catch {
      toast.error("Failed to upload label");
    } finally {
      setUploadingId(null);
      pendingShipmentId.current = null;
    }
  }

  function updateShipment(id: string, patch: Partial<AdminShipmentRow>) {
    setData((prev) => prev ? {
      ...prev,
      data: prev.data.map((s) => s.id === id ? { ...s, ...patch } : s),
    } : prev);
  }

  async function handleRetryAwb(shipmentId: string) {
    setRetryingId(shipmentId);
    try {
      const result = await retryShipmentAwb(shipmentId);
      updateShipment(shipmentId, {
        awb_code: result.awbCode,
        label_url: result.labelUrl,
        invoice_url: result.invoiceUrl,
        manifest_url: result.manifestUrl,
      });
      toast.success(`AWB assigned: ${result.awbCode}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to assign AWB");
    } finally {
      setRetryingId(null);
    }
  }

  async function handleRetryDocuments(shipmentId: string) {
    setRetryingId(shipmentId);
    try {
      const result = await retryShipmentDocuments(shipmentId);
      updateShipment(shipmentId, {
        label_url: result.labelUrl,
        invoice_url: result.invoiceUrl,
        manifest_url: result.manifestUrl,
      });
      toast.success("Documents regenerated");
    } catch (e: any) {
      toast.error(e.message || "Failed to regenerate documents");
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <div className="w-full space-y-8 text-white">
      <div className="pb-6 border-b border-[#1f1f1f]">
        <h1 className="text-2xl font-semibold tracking-tight">Shipments</h1>
        <p className="text-sm text-zinc-400 mt-1">Track all consumer orders and sample shipments</p>
      </div>

      {/* Hidden file input for label uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm bg-[#111111] border border-[#1f1f1f] rounded-md text-white focus:outline-none focus:border-zinc-600"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="SHIPPED">Shipped</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="RETURNED">Returned</option>
          <option value="RTO">RTO</option>
        </select>
        {data && <span className="text-xs text-zinc-500">{data.pagination.total} shipments</span>}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      ) : (data?.data ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-600">
          <Truck className="h-8 w-8 mb-3" />
          <p className="text-sm">No shipments found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[#1f1f1f] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f1f1f] bg-[#0b0b0b]">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Order / Pitch</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">AWB</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Shiprocket ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Shipped</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Delivered</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Label</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Manifest</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Track</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Retry</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((shipment) => (
                <tr key={shipment.id} className="border-b border-[#1a1a1a] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                      {shipment.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {shipment.order ? (
                      <p className="text-zinc-300 text-xs font-mono">#{shipment.order.order_number}</p>
                    ) : shipment.pitch ? (
                      <p className="text-zinc-500 text-xs">Pitch sample</p>
                    ) : <p className="text-zinc-600">—</p>}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs font-mono">
                    {shipment.awb_code ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs font-mono">
                    {shipment.shiprocket_shipment_id ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[shipment.status] ?? "bg-zinc-800 text-zinc-400"}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {shipment.shipped_at ? new Date(shipment.shipped_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {shipment.delivered_at ? new Date(shipment.delivered_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {shipment.label_url ? (
                      <a
                        href={shipment.label_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        View
                      </a>
                    ) : (
                      <button
                        onClick={() => handleUploadClick(shipment.id)}
                        disabled={uploadingId === shipment.id}
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                      >
                        {uploadingId === shipment.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Upload className="w-3.5 h-3.5" />}
                        Upload
                      </button>
                    )}
                  </td>
                  {/* Invoice */}
                  <td className="px-4 py-3">
                    {shipment.invoice_url ? (
                      <a href={shipment.invoice_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        <FileText className="w-3.5 h-3.5" /> View
                      </a>
                    ) : <span className="text-zinc-700 text-xs">—</span>}
                  </td>

                  {/* Manifest */}
                  <td className="px-4 py-3">
                    {shipment.manifest_url ? (
                      <a href={shipment.manifest_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                        <ClipboardList className="w-3.5 h-3.5" /> View
                      </a>
                    ) : <span className="text-zinc-700 text-xs">—</span>}
                  </td>

                  {/* Track */}
                  <td className="px-4 py-3">
                    {shipment.tracking_url ? (
                      <a href={shipment.tracking_url} target="_blank" rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : <span className="text-zinc-700">—</span>}
                  </td>

                  {/* Retry actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Retry AWB — only when no AWB yet but Shiprocket shipment exists */}
                      {!shipment.awb_code && shipment.shiprocket_shipment_id && (
                        <button
                          onClick={() => handleRetryAwb(shipment.id)}
                          disabled={retryingId === shipment.id}
                          title="Assign AWB + generate all documents"
                          className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
                        >
                          {retryingId === shipment.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <RotateCcw className="w-3.5 h-3.5" />}
                          AWB
                        </button>
                      )}
                      {/* Retry documents — when AWB exists but any document is missing */}
                      {shipment.awb_code && (!shipment.label_url || !shipment.invoice_url || !shipment.manifest_url) && (
                        <button
                          onClick={() => handleRetryDocuments(shipment.id)}
                          disabled={retryingId === shipment.id}
                          title="Regenerate missing label / invoice / manifest"
                          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
                        >
                          {retryingId === shipment.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <RefreshCw className="w-3.5 h-3.5" />}
                          Docs
                        </button>
                      )}
                      {/* All good */}
                      {shipment.awb_code && shipment.label_url && shipment.invoice_url && shipment.manifest_url && (
                        <span className="text-xs text-emerald-600">✓ Complete</span>
                      )}
                      {/* Nothing to retry */}
                      {!shipment.awb_code && !shipment.shiprocket_shipment_id && (
                        <span className="text-zinc-700 text-xs">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
