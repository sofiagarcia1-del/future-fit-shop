export type TryOnUiStatus = "idle" | "uploading" | "generating" | "success" | "error";

export type TryOnRecordStatus = "processing" | "completed" | "failed";

export type TryOnResult = {
  id: number;
  userId: number;
  productId: number;
  productName?: string;
  productBrand?: string;
  productImage?: string;
  originalUserImage: string | null;
  garmentImage: string;
  generatedImage: string | null;
  status: TryOnRecordStatus;
  errorMessage: string | null;
  saved: boolean;
  createdAt: string;
};

export type StartTryOnRequest = {
  productId: string;
  userImage?: string;
  userImageUrl?: string;
  source: "upload" | "profile";
};

export type StartTryOnResponse = {
  tryOnId: number;
  status: TryOnRecordStatus;
  generatedImage?: string;
  errorMessage?: string;
};

export type TryOnStatusResponse = {
  tryOnId: number;
  status: TryOnRecordStatus;
  generatedImage: string | null;
  errorMessage: string | null;
};
