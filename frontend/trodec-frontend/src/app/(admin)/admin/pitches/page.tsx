"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, Lightbulb, Truck, Upload, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  getAdminPitches,
  uploadShipmentLabel,
  adminCreateSampleShipmentForPitch,
  AdminPitchRow,
  AdminPitchSampleShipment,
  PaginatedResult,
} from "@/services/admin.service";

const PITCH_STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-500/10 text-amber-400",
  accepted:  "bg-blue-500/10 text-blue-400",
  declined:  "bg-red-500/10 text-red-400",
  shipped:   "bg-cyan-500/10 text-cyan-400",
  delivered: "bg-emerald-500/10 text-emerald-400",
  posted:    "bg-purple-500/10 text-purple-400",
};

const SHIPMENT_STATUS_STYLES: Record<string, string> = {
  PENDING:          "text-amber-400",
  SHIPPED:          "text-blue-400",
  OUT_FOR_DELIVERY: "text-purple-400",
  DELIVERED:        "text-emerald-400",
  RETURNED:         "text-orange-400",
  RTO:              "text-red-400",
};

export default function AdminPitchesPage() {
  const [data, setData] = useState<PaginatedResult<AdminPitchRow> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [uploadingShipmentId, setUploadingShipmentId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingShipmentId = useRef<string | null>(null);
  const pendingPitchId = useRef<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getAdminPitches({ status: statusFilter || undefined });
      setData(result);
    } catch {
      toast.error("Failed to load pitches");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  function updatePitchShipment(pitchId: string, shipment: AdminPitchSampleShipment) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            data: prev.data.map((p) =>
              p.id === pitchId ? { ...p, sample_shipment: shipment } : p
            ),
          }
        : prev
    );
  }

  async function handleCreateShipment(pitchId: string) {
    setActioningId(pitchId);
    try {
      const result = await adminCreateSampleShipmentForPitch(pitchId);
      updatePitchShipment(pitchId, {
        id: result.id,
        status: "PENDING",
        type: "SAMPLE",
        label_url: result.label_url,
        awb_code: result.awb_code ?? null,
      });
      toast.success(result.awb_code ? `Shipment created — AWB: ${result.awb_code}` : "Shipment created (AWB pending)");
    } catch (e: any) {
      toast.error(e.message || "Failed to create shipment");
    } finally {
      setActioningId(null);
    }
  }

  function handleUploadClick(shipmentId: string, pitchId: string) {
    pendingShipmentId.current = shipmentId;
    pendingPitchId.current = pitchId;
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const shipmentId = pendingShipmentId.current;
    const pitchId = pendingPitchId.current;
    if (!file || !shipmentId || !pitchId) return;
    e.target.value = "";
    try {
      setUploadingShipmentId(shipmentId);
      const { labelUrl } = await uploadShipmentLabel(shipmentId, file);
      setData((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((p) =>
                p.id === pitchId && p.sample_shipment
                  ? { ...p, sample_shipment: { ...p.sample_shipment, label_url: labelUrl } }
                  : p
              ),
            }
          : prev
      );
      toast.success("Label uploaded — brand can now download it");
    } catch {
      toast.error("Failed to upload label");
    } finally {
      setUploadingShipmentId(null);
      pendingShipmentId.current = null;
      pendingPitchId.current = null;
    }
  }

  return (
    <div className="w-full space-y-8 text-white">
      <div className="pb-6 border-b border-[#1f1f1f]">
        <h1 className="text-2xl font-semibold tracking-tight">Pitches</h1>
        <p className="text-sm text-zinc-400 mt-1">Monitor all brand → expert pitches and manage sample shipments</p>
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
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="posted">Posted</option>
        </select>
        {data && <span className="text-xs text-zinc-500">{data.pagination.total} pitches</span>}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        </div>
      ) : (data?.data ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-600">
          <Lightbulb className="h-8 w-8 mb-3" />
          <p className="text-sm">No pitches found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-[#1f1f1f] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f1f1f] bg-[#0b0b0b]">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Brand</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Expert</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Community</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Sample</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Shipment</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Label</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((pitch) => {
                const shipment = pitch.sample_shipment;
                const canCreateShipment = ["accepted", "shipped", "delivered"].includes(pitch.status) && !shipment?.awb_code;
                const isActioning = actioningId === pitch.id;
                const isUploading = uploadingShipmentId === shipment?.id;

                return (
                  <tr key={pitch.id} className="border-b border-[#1a1a1a] hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 text-zinc-300 font-medium">
                      {pitch.brand?.brand_name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-zinc-300">{pitch.expert?.full_name ?? "—"}</p>
                      <p className="text-xs text-zinc-600">{pitch.expert?.email ?? ""}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{pitch.product?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-400">{pitch.community?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{pitch.sample_type?.replace("_", " ")}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${PITCH_STATUS_STYLES[pitch.status] ?? "bg-zinc-800 text-zinc-400"}`}>
                        {pitch.status}
                      </span>
                    </td>

                    {/* Shipment status + create action */}
                    <td className="px-4 py-3">
                      {shipment ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Truck className="w-3 h-3 text-zinc-500" />
                            <span className={`text-xs font-medium ${SHIPMENT_STATUS_STYLES[shipment.status] ?? "text-zinc-400"}`}>
                              {shipment.status}
                            </span>
                          </div>
                          {shipment.awb_code && (
                            <p className="text-xs text-zinc-600 font-mono">{shipment.awb_code}</p>
                          )}
                          {canCreateShipment && (
                            <button
                              onClick={() => handleCreateShipment(pitch.id)}
                              disabled={isActioning}
                              title="Retry sample shipment creation on Shiprocket"
                              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50 mt-1"
                            >
                              {isActioning ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                              Retry
                            </button>
                          )}
                        </div>
                      ) : canCreateShipment ? (
                        <button
                          onClick={() => handleCreateShipment(pitch.id)}
                          disabled={isActioning}
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                        >
                          {isActioning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
                          Create Shipment
                        </button>
                      ) : (
                        <span className="text-zinc-700 text-xs">—</span>
                      )}
                    </td>

                    {/* Label upload / download */}
                    <td className="px-4 py-3">
                      {shipment ? (
                        <div className="flex flex-col gap-1">
                          {shipment.label_url && (
                            <a
                              href={shipment.label_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              View
                            </a>
                          )}
                          <button
                            onClick={() => handleUploadClick(shipment.id, pitch.id)}
                            disabled={isUploading}
                            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
                          >
                            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            {shipment.label_url ? "Replace" : "Upload"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-zinc-700 text-xs">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {new Date(pitch.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
