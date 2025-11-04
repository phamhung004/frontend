import { getSupabaseClient } from './supabaseClient';

const DEFAULT_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ?? 'product-media';

export interface UploadOptions {
  folder?: string;
  slug?: string;
}

export interface UploadResult {
  publicUrl: string;
  path: string;
}

const buildObjectPath = (fileName: string, { folder, slug }: UploadOptions = {}): string => {
  const cleanedSlug = slug?.trim().toLowerCase() ?? 'product';
  const baseFolder = folder?.trim() ?? `products/${cleanedSlug}`;
  return `${baseFolder.replace(/\/+$/g, '')}/${fileName}`;
};

const createFileName = (file: File): string => {
  const extension = file.name.split('.').pop() ?? 'jpg';
  const randomId = crypto.randomUUID();
  return `${Date.now()}-${randomId}.${extension}`;
};

export const uploadProductAsset = async (file: File, options: UploadOptions = {}): Promise<UploadResult> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const bucket = DEFAULT_BUCKET;
  if (!bucket) {
    throw new Error('Supabase storage bucket is not configured.');
  }

  const fileName = createFileName(file);
  const objectPath = buildObjectPath(fileName, options);

  const { error } = await supabase.storage.from(bucket).upload(objectPath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  if (!data?.publicUrl) {
    throw new Error('Supabase did not return a public URL for the uploaded file.');
  }

  return {
    publicUrl: data.publicUrl,
    path: objectPath,
  };
};
