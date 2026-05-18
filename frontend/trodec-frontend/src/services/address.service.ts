import api, { ApiSuccessResponse, getErrorMessage } from './api';

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface UpdateAddressData {
  fullName?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export async function getAddresses(): Promise<Address[]> {
  try {
    const response = await api.get<ApiSuccessResponse<Address[]>>('/addresses');
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getAddress(id: string): Promise<Address> {
  try {
    const response = await api.get<ApiSuccessResponse<Address>>(`/addresses/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createAddress(data: CreateAddressData): Promise<Address> {
  try {
    const response = await api.post<ApiSuccessResponse<Address>>('/addresses', data);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateAddress(id: string, data: UpdateAddressData): Promise<Address> {
  try {
    const response = await api.patch<ApiSuccessResponse<Address>>(`/addresses/${id}`, data);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteAddress(id: string): Promise<void> {
  try {
    await api.delete(`/addresses/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function setDefaultShipping(id: string): Promise<Address> {
  try {
    const response = await api.post<ApiSuccessResponse<Address>>(`/addresses/${id}/set-default-shipping`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function setDefaultBilling(id: string): Promise<Address> {
  try {
    const response = await api.post<ApiSuccessResponse<Address>>(`/addresses/${id}/set-default-billing`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
