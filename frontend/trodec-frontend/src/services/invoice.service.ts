import api, { ApiSuccessResponse, getErrorMessage } from "./api";

export interface InvoiceItem {
  name: string;
  quantity: number;
  selectedSize: string | null;
  price: number;
  subtotal: number;
}

export interface AddressSnapshot {
  name: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal: string;
  country: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  brandId: string;
  orderId: string;
  status: "generated" | "sent" | "downloaded";
  brandName: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  registeredAddress: string | null;
  billingEmail: string | null;
  contactNumber: string | null;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  items: InvoiceItem[] | null;
  shippingAddress: AddressSnapshot | null;
  billingAddress: AddressSnapshot | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceableOrder {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  hasInvoice: boolean;
  status: string;
  customerName: string | null;
}

export const InvoiceService = {
  async listInvoices(): Promise<Invoice[]> {
    try {
      const res = await api.get<ApiSuccessResponse<Invoice[]>>("/invoices");
      return (res.data as any).data ?? [];
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async listInvoiceableOrders(): Promise<InvoiceableOrder[]> {
    try {
      const res = await api.get<ApiSuccessResponse<InvoiceableOrder[]>>("/invoices/orders");
      return (res.data as any).data ?? [];
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async createInvoice(orderId: string): Promise<Invoice> {
    try {
      const res = await api.post<ApiSuccessResponse<Invoice>>("/invoices", { orderId });
      return (res.data as any).data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const res = await api.get<ApiSuccessResponse<Invoice>>(`/invoices/${invoiceId}`);
      return (res.data as any).data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async markDownloaded(invoiceId: string): Promise<void> {
    try {
      await api.patch(`/invoices/${invoiceId}/downloaded`);
    } catch {
      // Silent — non-critical
    }
  },
};
