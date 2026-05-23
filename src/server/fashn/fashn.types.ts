export type FashnRunResponse = {
  id: string;
  error: { name?: string; message?: string } | null;
};

export type FashnStatus =
  | "starting"
  | "in_queue"
  | "processing"
  | "completed"
  | "failed";

export type FashnStatusResponse = {
  id: string;
  status: FashnStatus;
  output?: string[];
  error?: { name?: string; message?: string } | null;
};

export type FashnTryOnInputs = {
  product_image: string;
  model_image: string;
};
