import api, { getErrorMessage } from "./api";

export interface UploadResponse {
  url: string;
}

/**
 * Upload a community image (avatar or cover) via multipart/form-data.
 *
 * @param communityId - The community ID
 * @param file        - The image File object
 * @param type        - "avatar" or "cover"
 * @returns The public URL of the uploaded image
 */
export async function uploadCommunityImage(
  communityId: string,
  file: File,
  type: "avatar" | "cover"
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await api.post<{ success: boolean; data: UploadResponse }>(
      `/communities/${communityId}/upload-image`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data.data.url;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Upload a media file for a post via multipart/form-data.
 */
export async function uploadPostMedia(
  postId: string,
  file: File,
  displayOrder: number = 0
): Promise<{ id: string; mediaUrl: string; mediaType: string; displayOrder: number }> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("displayOrder", String(displayOrder));

    const response = await api.post<{ success: boolean; data: { id: string; mediaUrl: string; mediaType: string; displayOrder: number } }>(
      `/posts/${postId}/upload-media`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Upload an image file for a product.
 */
export async function uploadProductImage(
  productId: string,
  file: File,
  isPrimary: boolean = false,
  displayOrder: number = 0
): Promise<{ id: string; imageUrl: string; altText: string | null; isPrimary: boolean; displayOrder: number }> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("isPrimary", String(isPrimary));
    formData.append("displayOrder", String(displayOrder));

    const response = await api.post<{ success: boolean; data: { id: string; imageUrl: string; altText: string | null; isPrimary: boolean; displayOrder: number } }>(
      `/products/${productId}/upload-image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Remove a community image (avatar or cover).
 */
export async function removeCommunityImage(
  communityId: string,
  type: "avatar" | "cover"
): Promise<void> {
  try {
    await api.delete(`/communities/${communityId}/remove-image`, {
      data: { type },
    });
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
