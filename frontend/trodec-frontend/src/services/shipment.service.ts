import api, { ApiSuccessResponse, getErrorMessage } from './api';

export type ShipmentStatus = "PENDING" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "RETURNED" | "RTO";

export interface PitchShipment {
  id: string;
  pitchId: string | null;
  trackingId: string;
  awbCode: string | null;
  labelUrl: string | null;
  carrier: string;
  type: string;
  status: ShipmentStatus;
  fromAddress: Record<string, unknown>;
  toAddress: Record<string, unknown>;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  liveTracking: {
    status: string;
    currentLocation?: string;
    lastUpdated?: string;
  } | null;
}

export async function refreshShipmentLabel(shipmentId: string): Promise<string> {
  try {
    const response = await api.post<ApiSuccessResponse<{ labelUrl: string }>>(`/shipments/${shipmentId}/refresh-label`);
    return response.data.data.labelUrl;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getPitchShipment(pitchId: string): Promise<PitchShipment> {
  try {
    const response = await api.get<ApiSuccessResponse<PitchShipment>>(`/pitches/${pitchId}/shipment`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export function getShipmentStatusLabel(status: ShipmentStatus): string {
  const labels: Record<ShipmentStatus, string> = {
    PENDING: "Pending",
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    RETURNED: "Returned",
    RTO: "Return to Origin",
  };
  return labels[status] ?? status;
}

export function getShipmentStatusColor(status: ShipmentStatus): string {
  const colors: Record<ShipmentStatus, string> = {
    PENDING: "text-zinc-400 border-zinc-700",
    SHIPPED: "text-blue-400 border-blue-700",
    OUT_FOR_DELIVERY: "text-yellow-400 border-yellow-700",
    DELIVERED: "text-emerald-400 border-emerald-700",
    RETURNED: "text-red-400 border-red-700",
    RTO: "text-orange-400 border-orange-700",
  };
  return colors[status] ?? "text-zinc-400 border-zinc-700";
}
