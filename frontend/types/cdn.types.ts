export type UploadPhotosFieldName = "image" | "images";

export interface UploadedPhotoFile {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  originalName: string;
}

export interface UploadPhotosResponse {
  url: string;
  files: UploadedPhotoFile[];
}

export interface UploadPhotosOptions {
  fieldName?: UploadPhotosFieldName;
  token?: string | null;
}
