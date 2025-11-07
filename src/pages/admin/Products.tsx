import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PlusCircleIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { productService } from '../../services/productService';
import categoryService, { type Category } from '../../services/categoryService';
import type {
  Product,
  ProductDetail,
  ProductFormData,
  ProductFormMedia,
  ProductFormVariant,
  ProductRequest,
} from '../../types/product';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../components/ui/ToastContainer';
import { useConfirm } from '../../components/ui/useConfirm';
import { uploadProductAsset } from '../../services/storageService';
import { fileUploadService } from '../../services/fileUploadService';
import ToggleSwitch from '../../components/ui/ToggleSwitch';


const placeholderImage = '/images/placeholder.webp';

const createVariantClientId = () =>
  typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `variant-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createMediaClientId = () =>
  typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function'
    ? `media-${globalThis.crypto.randomUUID()}`
    : `media-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeMediaList = (media: ProductFormMedia[]): ProductFormMedia[] => {
  const sorted = [...media]
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((item, index) => ({
      ...item,
      displayOrder: index + 1,
    }));

  if (!sorted.some((item) => item.isPrimary) && sorted[0]) {
    sorted[0] = { ...sorted[0], isPrimary: true };
  }

  return sorted;
};

const upsertVariantMedia = (
  media: ProductFormMedia[],
  variant: ProductFormVariant,
): ProductFormMedia[] => {
  const key = variant.clientId;
  const trimmedUrl = variant.imageUrl?.trim();
  const trimmedName = variant.name?.trim() ?? '';
  const filtered = media.filter((item) => item.sourceVariantKey !== key);

  if (!trimmedUrl) {
    return normalizeMediaList(filtered);
  }

  const existingIndex = filtered.findIndex((item) => item.imageUrl === trimmedUrl);
  const updated = [...filtered];

  if (existingIndex >= 0) {
    updated[existingIndex] = {
      ...updated[existingIndex],
      altText: trimmedName,
      sourceVariantKey: key,
    };
    return normalizeMediaList(updated);
  }

  const hasPrimary = updated.some((item) => item.isPrimary);
  updated.push({
    clientId: key,
    imageUrl: trimmedUrl,
    altText: trimmedName,
    displayOrder: updated.length + 1,
    isPrimary: hasPrimary ? false : updated.length === 0,
    previewUrl: trimmedUrl,
    isUploading: false,
    sourceVariantKey: key,
  });

  return normalizeMediaList(updated);
};

const removeVariantMediaByKey = (
  media: ProductFormMedia[],
  key: string,
): ProductFormMedia[] => normalizeMediaList(media.filter((item) => item.sourceVariantKey !== key));

type VariantEditableField = 'name' | 'sku' | 'price' | 'stockQuantity' | 'attributes';

const createDefaultForm = (): ProductFormData => ({
  categoryId: '',
  name: '',
  slug: '',
  sku: '',
  shortDescription: '',
  longDescription: '',
  regularPrice: '',
  salePrice: '',
  badgeLabel: '',
  thumbnailUrl: '',
  stockQuantity: '0',
  isPublished: true,
  landingPageEnabled: false,
  productType: 'PHYSICAL',
  fileUrl: '',
  fileSize: '',
  pageCount: '',
  fileFormat: 'PDF',
  isDownloadable: false,
  requiresLogin: true,
  media: [],
  variants: [],
});

const Products = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(() => createDefaultForm());
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const registerObjectUrl = (url: string) => {
    if (url.startsWith('blob:')) {
      objectUrlsRef.current.add(url);
    }
  };

  const revokeObjectUrl = (url?: string | null) => {
    if (!url || !url.startsWith('blob:')) {
      return;
    }
    URL.revokeObjectURL(url);
    objectUrlsRef.current.delete(url);
  };

  const cleanupObjectUrls = () => {
    objectUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    objectUrlsRef.current.clear();
  };

  useEffect(() => {
    return () => {
      cleanupObjectUrls();
    };
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          productService.getAllProducts(),
          categoryService.getAllCategories(),
        ]);
        setProducts(productResponse);
        setCategories(categoryResponse);
      } catch (error) {
        console.error('Failed to load data', error);
        toast.error(
          t('admin.error') ?? 'Error',
          t('admin.productsLoadFailed') ?? 'Unable to load data'
        );
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [t]);

  const resetForm = () => {
    cleanupObjectUrls();
    setFormData(createDefaultForm());
    setSelectedProduct(null);
    setThumbnailPreview(null);
    setIsThumbnailUploading(false);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      try {
        setLoading(true);
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setLoading(false);
      }
      return;
    }
    try {
      setLoading(true);
      const result = await productService.searchProducts(searchTerm.trim());
      setProducts(result);
    } catch (error) {
      console.error('Search failed', error);
      toast.error(
        t('admin.error') ?? 'Error',
        t('admin.productSearchFailed') ?? 'Search failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleFormChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };

      if (field === 'name' && typeof value === 'string') {
        next.slug = generateSlug(value);
      }

      if (field === 'productType' && typeof value === 'string') {
        if (value === 'PDF') {
          next.isDownloadable = true;
          next.requiresLogin = true;
        }
      }

      return next;
    });
  };

  const deriveSlug = () => {
    const trimmedSlug = formData.slug.trim();
    if (trimmedSlug) {
      return trimmedSlug;
    }
    if (formData.name.trim()) {
      return generateSlug(formData.name);
    }
    return `product-${Date.now()}`;
  };

  const handleThumbnailUpload = async (file: File) => {
    const previousUrl = formData.thumbnailUrl;
    const tempUrl = URL.createObjectURL(file);
    registerObjectUrl(tempUrl);
    setThumbnailPreview(tempUrl);
    setIsThumbnailUploading(true);

    try {
      const slug = deriveSlug();
      const { publicUrl } = await uploadProductAsset(file, {
        slug,
        folder: `products/${slug}/thumbnail`,
      });

      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: publicUrl,
      }));
      setThumbnailPreview(publicUrl);

      toast.success(
        t('admin.success') ?? 'Success',
        t('admin.thumbnailUploadSuccess') ?? 'Thumbnail uploaded successfully.'
      );
    } catch (error) {
      console.error('Thumbnail upload failed', error);
      setThumbnailPreview(previousUrl || null);
      toast.error(
        t('admin.error') ?? 'Error',
        t('admin.thumbnailUploadFailed') ?? 'Unable to upload thumbnail.'
      );
    } finally {
      setIsThumbnailUploading(false);
      revokeObjectUrl(tempUrl);
    }
  };

  const removeThumbnail = () => {
    revokeObjectUrl(thumbnailPreview);
    setThumbnailPreview(null);
    setFormData((prev) => ({
      ...prev,
      thumbnailUrl: '',
    }));
  };

  const onThumbnailFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    void handleThumbnailUpload(file);
    event.target.value = '';
  };

  const handlePdfFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file
    const validation = fileUploadService.validatePdfFile(file);
    if (!validation.valid) {
      toast.error(
        t('admin.error') ?? 'Error',
        validation.error ?? 'Invalid PDF file'
      );
      event.target.value = '';
      return;
    }

    try {
      setIsPdfUploading(true);
      setPdfUploadProgress(0);

      const result = await fileUploadService.uploadPdf(file, (progress) => {
        setPdfUploadProgress(progress);
      });

      // Update form data with upload result
      setFormData((prev) => ({
        ...prev,
        fileUrl: result.fileUrl,
        fileSize: result.fileSize,
        pageCount: result.pageCount.toString(),
        fileFormat: result.fileFormat,
      }));

      toast.success(
        t('admin.success') ?? 'Success',
        'PDF file uploaded successfully'
      );
    } catch (error) {
      console.error('PDF upload failed', error);
      toast.error(
        t('admin.error') ?? 'Error',
        'Failed to upload PDF file'
      );
    } finally {
      setIsPdfUploading(false);
      setPdfUploadProgress(0);
      event.target.value = '';
    }
  };

  const removePdfFile = async () => {
    if (!formData.fileUrl) {
      return;
    }

    try {
      await fileUploadService.deletePdf(formData.fileUrl);
      
      setFormData((prev) => ({
        ...prev,
        fileUrl: '',
        fileSize: '',
        pageCount: '',
      }));

      toast.success(
        t('admin.success') ?? 'Success',
        'PDF file removed successfully'
      );
    } catch (error) {
      console.error('Failed to delete PDF', error);
      toast.error(
        t('admin.error') ?? 'Error',
        'Failed to remove PDF file'
      );
    }
  };

  const handleVariantImageUpload = async (index: number, file: File) => {
    const tempUrl = URL.createObjectURL(file);
    registerObjectUrl(tempUrl);

    setFormData((prev) => {
      const variants = [...prev.variants];
      const target = variants[index];
      if (!target) {
        revokeObjectUrl(tempUrl);
        return prev;
      }

      if (target.previewUrl && target.previewUrl.startsWith('blob:')) {
        revokeObjectUrl(target.previewUrl);
      }

      variants[index] = {
        ...target,
        previewUrl: tempUrl,
        isUploading: true,
      };

      return { ...prev, variants };
    });

    try {
      const slug = deriveSlug();
      const { publicUrl } = await uploadProductAsset(file, {
        slug,
        folder: `products/${slug}/variants`,
      });

      toast.success(
        t('admin.success') ?? 'Success',
        t('admin.imageUploadSuccess') ?? 'Image uploaded successfully.'
      );

      setFormData((prev) => {
        const variants = [...prev.variants];
        const target = variants[index];
        if (!target) {
          return prev;
        }

        if (target.previewUrl && target.previewUrl.startsWith('blob:')) {
          revokeObjectUrl(target.previewUrl);
        }

        const updatedVariant: ProductFormVariant = {
          ...target,
          imageUrl: publicUrl,
          previewUrl: publicUrl,
          isUploading: false,
        };
        variants[index] = updatedVariant;

        const media = upsertVariantMedia(prev.media, updatedVariant);

        return { ...prev, variants, media };
      });
    } catch (error) {
      console.error('Variant image upload failed', error);
      toast.error(
        t('admin.error') ?? 'Error',
        t('admin.imageUploadFailed') ?? 'Unable to upload image.'
      );
      setFormData((prev) => {
        const variants = [...prev.variants];
        const target = variants[index];
        if (!target) {
          return prev;
        }

        if (target.previewUrl && target.previewUrl.startsWith('blob:')) {
          revokeObjectUrl(target.previewUrl);
        }

        variants[index] = {
          ...target,
          previewUrl: target.imageUrl ? target.imageUrl : null,
          isUploading: false,
        };

        return { ...prev, variants };
      });
    } finally {
      revokeObjectUrl(tempUrl);
    }
  };

  const onVariantFileChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    void handleVariantImageUpload(index, file);
    event.target.value = '';
  };

  const removeVariantImage = (index: number) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      const target = variants[index];
      if (!target) {
        return prev;
      }

      if (target.previewUrl && target.previewUrl.startsWith('blob:')) {
        revokeObjectUrl(target.previewUrl);
      }

      const updatedVariant: ProductFormVariant = {
        ...target,
        imageUrl: '',
        previewUrl: null,
        isUploading: false,
      };
      variants[index] = updatedVariant;

      const media = removeVariantMediaByKey(prev.media, target.clientId);

      return { ...prev, variants, media };
    });
  };

  const addVariant = () => {
    const clientId = createVariantClientId();
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          clientId,
          name: '',
          sku: '',
          price: '',
          stockQuantity: '0',
          imageUrl: '',
          attributes: '',
          previewUrl: null,
          isUploading: false,
        },
      ],
    }));
  };

  const updateVariant = (index: number, field: VariantEditableField, value: string) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      const target = variants[index];
      if (!target) {
        return prev;
      }

      const updatedVariant: ProductFormVariant = {
        ...target,
        [field]: value,
      };
      variants[index] = updatedVariant;

      const media = field === 'name' ? upsertVariantMedia(prev.media, updatedVariant) : prev.media;

      return { ...prev, variants, media };
    });
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => {
      const target = prev.variants[index];
      if (!target) {
        return prev;
      }

      if (target.previewUrl && target.previewUrl.startsWith('blob:')) {
        revokeObjectUrl(target.previewUrl);
      }

      const variants = prev.variants.filter((_, idx) => idx !== index);
      const media = removeVariantMediaByKey(prev.media, target.clientId);

      return { ...prev, variants, media };
    });
  };

  const handleMediaFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    const slug = deriveSlug();
    const files = Array.from(fileList).map((file) => ({
      file,
      clientId: createMediaClientId(),
      tempUrl: URL.createObjectURL(file),
    }));

    files.forEach(({ tempUrl }) => {
      registerObjectUrl(tempUrl);
    });

    setFormData((prev) => {
      let media = [...prev.media];
      files.forEach(({ clientId, tempUrl }) => {
        const hasPrimary = media.some((item) => item.isPrimary);
        media.push({
          clientId,
          imageUrl: '',
          altText: '',
          displayOrder: media.length + 1,
          isPrimary: hasPrimary ? false : media.length === 0,
          previewUrl: tempUrl,
          isUploading: true,
        });
      });
      media = normalizeMediaList(media);
      return { ...prev, media };
    });

    files.forEach(({ file, clientId, tempUrl }) => {
      uploadProductAsset(file, {
        slug,
        folder: `products/${slug}/gallery`,
      })
        .then(({ publicUrl }) => {
          let shouldNotify = false;
          setFormData((prev) => {
            const exists = prev.media.some((item) => item.clientId === clientId);
            if (!exists) {
              return prev;
            }
            const media = prev.media.map((item) => {
              if (item.clientId !== clientId) {
                return item;
              }
              if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
                revokeObjectUrl(item.previewUrl);
              }
              return {
                ...item,
                imageUrl: publicUrl,
                previewUrl: publicUrl,
                isUploading: false,
              };
            });
            shouldNotify = true;
            return { ...prev, media: normalizeMediaList(media) };
          });
          if (shouldNotify) {
            toast.success(
              t('admin.success') ?? 'Success',
              t('admin.imageUploadSuccess') ?? 'Image uploaded successfully.'
            );
          }
        })
        .catch((error) => {
          console.error('Product media upload failed', error);
          let shouldNotify = false;
          setFormData((prev) => {
            const target = prev.media.find((item) => item.clientId === clientId);
            if (!target) {
              return prev;
            }
            if (target.previewUrl && target.previewUrl.startsWith('blob:')) {
              revokeObjectUrl(target.previewUrl);
            }
            const filtered = prev.media.filter((item) => item.clientId !== clientId);
            shouldNotify = true;
            return { ...prev, media: normalizeMediaList(filtered) };
          });
          if (shouldNotify) {
            toast.error(
              t('admin.error') ?? 'Error',
              t('admin.imageUploadFailed') ?? 'Unable to upload image.'
            );
          }
        })
        .finally(() => {
          revokeObjectUrl(tempUrl);
        });
    });

    event.target.value = '';
  };

  const setPrimaryMediaItem = (clientId: string) => {
    setFormData((prev) => {
      if (!prev.media.some((item) => item.clientId === clientId)) {
        return prev;
      }
      const media = prev.media.map((item) => ({
        ...item,
        isPrimary: item.clientId === clientId,
      }));
      return { ...prev, media };
    });
  };

  const updateMediaAltText = (clientId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.map((item) =>
        item.clientId === clientId ? { ...item, altText: value } : item
      ),
    }));
  };

  const removeMediaItem = (clientId: string) => {
    setFormData((prev) => {
      const target = prev.media.find((item) => item.clientId === clientId);
      if (target?.previewUrl && target.previewUrl.startsWith('blob:')) {
        revokeObjectUrl(target.previewUrl);
      }
      const filtered = prev.media.filter((item) => item.clientId !== clientId);
      return { ...prev, media: normalizeMediaList(filtered) };
    });
  };

  const openCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEdit = async (id: number) => {
    try {
      cleanupObjectUrls();
      setLoading(true);
      const detail = await productService.getProductById(id);
      setSelectedProduct(detail);

      const variantEntries: ProductFormVariant[] = (detail.variants ?? []).map((item) => {
        const clientId = item.id ? `variant-${item.id}` : createVariantClientId();
        return {
          id: item.id,
          clientId,
          name: item.name,
          sku: item.sku ?? '',
          price: item.price !== null && item.price !== undefined ? item.price.toString() : '',
          stockQuantity: item.stockQuantity.toString(),
          imageUrl: item.imageUrl ?? '',
          attributes: item.attributes ? JSON.stringify(item.attributes) : '',
          previewUrl: item.imageUrl ?? '',
          isUploading: false,
        };
      });

      const imageToClientIds = new Map<string, string[]>();
      variantEntries.forEach((variant) => {
        const url = variant.imageUrl.trim();
        if (!url) {
          return;
        }
        const queue = imageToClientIds.get(url) ?? [];
        queue.push(variant.clientId);
        imageToClientIds.set(url, queue);
      });

      const mediaEntries = normalizeMediaList(
        (detail.media ?? []).map((item, idx) => {
          const trimmedUrl = item.imageUrl;
          const queue = trimmedUrl ? imageToClientIds.get(trimmedUrl) : undefined;
          const sourceVariantKey = queue && queue.length > 0 ? queue.shift() : undefined;
          const clientId = sourceVariantKey ?? (item.id ? `media-${item.id}` : createMediaClientId());
          return {
            clientId,
            id: item.id,
            imageUrl: trimmedUrl,
            altText: item.altText ?? '',
            displayOrder: item.displayOrder ?? idx + 1,
            isPrimary: item.isPrimary ?? idx === 0,
            previewUrl: item.imageUrl,
            isUploading: false,
            sourceVariantKey,
          } satisfies ProductFormMedia;
        }),
      );

      let mediaWithVariants = mediaEntries;
      variantEntries.forEach((variant) => {
        mediaWithVariants = upsertVariantMedia(mediaWithVariants, variant);
      });

      setFormData({
        categoryId: detail.categoryId ? detail.categoryId.toString() : '',
        name: detail.name,
        slug: detail.slug,
        sku: detail.sku ?? '',
        shortDescription: detail.shortDescription ?? '',
        longDescription: detail.longDescription ?? '',
        regularPrice: detail.regularPrice.toString(),
        salePrice: detail.salePrice !== null && detail.salePrice !== undefined ? detail.salePrice.toString() : '',
        badgeLabel: detail.badgeLabel ?? '',
        thumbnailUrl: detail.thumbnailUrl ?? '',
        stockQuantity: detail.stockQuantity.toString(),
        isPublished: detail.isPublished,
        landingPageEnabled: detail.landingPageEnabled ?? false,
        productType: detail.productType ?? 'PHYSICAL',
        fileUrl: detail.fileUrl ?? '',
        fileSize: detail.fileSize ?? '',
        pageCount: detail.pageCount ? detail.pageCount.toString() : '',
        fileFormat: detail.fileFormat ?? 'PDF',
        isDownloadable: detail.isDownloadable ?? false,
        requiresLogin: detail.requiresLogin ?? true,
        media: mediaWithVariants,
        variants: variantEntries,
      });
      setThumbnailPreview(detail.thumbnailUrl ?? null);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Failed to load product detail', error);
      toast.error(
        t('admin.error') ?? 'Error',
        t('admin.productLoadFailed') ?? 'Unable to load product'
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.slug.trim() || !formData.categoryId) {
      toast.warning(
        t('admin.validationError') ?? 'Validation Error',
        t('admin.productFormMissingFields') ?? 'Please fill required fields'
      );
      return false;
    }

    const isPdfProduct = formData.productType === 'PDF';
    const regularPriceInput = formData.regularPrice.trim();
    const hasRegularPrice = regularPriceInput !== '';
    const regularPriceValue = hasRegularPrice ? parseFloat(regularPriceInput) : 0;

    if (!isPdfProduct) {
      if (!hasRegularPrice || Number.isNaN(regularPriceValue) || regularPriceValue < 0) {
        toast.warning(
          t('admin.validationError') ?? 'Validation Error',
          t('admin.productFormInvalidPrice') ?? 'Invalid regular price'
        );
        return false;
      }
    } else if (hasRegularPrice && (Number.isNaN(regularPriceValue) || regularPriceValue < 0)) {
      toast.warning(
        t('admin.validationError') ?? 'Validation Error',
        t('admin.productFormInvalidPrice') ?? 'Invalid regular price'
      );
      return false;
    }

    const salePriceInput = formData.salePrice.trim();
    if (salePriceInput) {
      const salePriceValue = parseFloat(salePriceInput);
      if (Number.isNaN(salePriceValue) || salePriceValue < 0) {
        toast.warning(
          t('admin.validationError') ?? 'Validation Error',
          t('admin.productFormInvalidPrice') ?? 'Invalid sale price'
        );
        return false;
      }

      const comparisonRegular = hasRegularPrice ? regularPriceValue : 0;
      if (salePriceValue > comparisonRegular) {
        toast.warning(
          t('admin.validationError') ?? 'Validation Error',
          t('admin.productFormSaleGreater') ?? 'Sale price must not exceed regular price'
        );
        return false;
      }
    }

    return true;
  };

  const parseVariants = (): NonNullable<ProductRequest['variants']> | null => {
    const variants: NonNullable<ProductRequest['variants']> = [];
    for (const variant of formData.variants) {
      if (!variant.name.trim()) {
        continue;
      }
      let parsedAttributes: Record<string, unknown> | undefined;
      if (variant.attributes.trim()) {
        try {
          parsedAttributes = JSON.parse(variant.attributes.trim());
        } catch (error) {
          console.error('Invalid JSON attributes', error);
          toast.warning(
            t('admin.validationError') ?? 'Validation Error',
            t('admin.productFormInvalidAttributes') ?? 'Variant attributes must be valid JSON'
          );
          return null;
        }
      }
      variants.push({
        id: variant.id,
        name: variant.name.trim(),
        sku: variant.sku.trim() || undefined,
        price: variant.price.trim() ? parseFloat(variant.price) : undefined,
        stockQuantity: variant.stockQuantity.trim() ? parseInt(variant.stockQuantity, 10) : 0,
        imageUrl: variant.imageUrl.trim() || undefined,
        attributes: parsedAttributes ?? undefined,
      });
    }
    return variants;
  };

  const parseMedia = (): NonNullable<ProductRequest['media']> => {
    const normalized = normalizeMediaList(formData.media);
    const media: NonNullable<ProductRequest['media']> = [];
    normalized.forEach((item) => {
      const trimmedUrl = item.imageUrl.trim();
      if (!trimmedUrl) {
        return;
      }
      media.push({
        id: item.id,
        imageUrl: trimmedUrl,
        altText: item.altText.trim() || undefined,
        displayOrder: item.displayOrder,
        isPrimary: item.isPrimary ?? false,
      });
    });
    return media;
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    const variants = parseVariants();
    if (variants === null) {
      return;
    }
    if (
      isThumbnailUploading ||
      formData.media.some((item) => item.isUploading) ||
      formData.variants.some((variant) => variant.isUploading)
    ) {
      toast.warning(
        t('admin.validationError') ?? 'Validation Error',
        t('admin.waitForUpload') ?? 'Please wait for all uploads to finish.'
      );
      return;
    }
    const media = parseMedia();
    if (media) {
      const primaryCount = media.filter((item) => item.isPrimary).length;
      if (primaryCount > 1) {
        toast.warning(
          t('admin.validationError') ?? 'Validation Error',
          t('admin.productFormPrimaryImage') ?? 'Only one image can be marked as primary'
        );
        return;
      }
    }
    const regularPriceInput = formData.regularPrice.trim();
    const normalizedRegularPrice = regularPriceInput ? parseFloat(regularPriceInput) : 0;
    const salePriceInput = formData.salePrice.trim();
    const normalizedSalePrice = salePriceInput ? parseFloat(salePriceInput) : undefined;

    const payload: ProductRequest = {
      categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      sku: formData.sku.trim() || undefined,
      shortDescription: formData.shortDescription.trim() || undefined,
      longDescription: formData.longDescription.trim() || undefined,
      regularPrice: normalizedRegularPrice,
      salePrice: normalizedSalePrice,
      badgeLabel: formData.badgeLabel.trim() || undefined,
      thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
      stockQuantity: formData.stockQuantity.trim() ? parseInt(formData.stockQuantity, 10) : 0,
      isPublished: formData.isPublished,
      landingPageEnabled: formData.landingPageEnabled,
      productType: formData.productType,
      fileUrl: formData.fileUrl.trim() || undefined,
      fileSize: formData.fileSize.trim() || undefined,
      pageCount: formData.pageCount.trim() ? parseInt(formData.pageCount, 10) : undefined,
      fileFormat: formData.fileFormat.trim() || undefined,
      isDownloadable: formData.isDownloadable,
      requiresLogin: formData.requiresLogin,
      media,
      variants,
    };
    try {
      setLoading(true);
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, payload);
        toast.success(
          t('admin.success') ?? 'Success',
          t('admin.productUpdated') ?? 'Product updated successfully'
        );
      } else {
        await productService.createProduct(payload);
        toast.success(
          t('admin.success') ?? 'Success',
          t('admin.productCreated') ?? 'Product created successfully'
        );
      }
      const refreshed = await productService.getAllProducts();
      setProducts(refreshed);
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error('Save failed', error);
      toast.error(
        t('admin.error') ?? 'Error',
        t('admin.productSaveFailed') ?? 'Unable to save product'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLandingPage = async (id: number) => {
    try {
      const updatedProduct = await productService.toggleLandingPage(id);
      
      setProducts((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, landingPageEnabled: updatedProduct.landingPageEnabled } : item
        )
      );
      
      toast.success(
        t('admin.success') ?? 'Success',
        updatedProduct.landingPageEnabled 
          ? 'Landing page đã được bật' 
          : 'Landing page đã được tắt'
      );
    } catch (error) {
      console.error('Failed to toggle landing page', error);
      toast.error(
        t('admin.error') ?? 'Error',
        'Không thể thay đổi trạng thái landing page'
      );
    }
  };

  const openDelete = async (id: number) => {
    const confirmed = await confirm({
      title: t('admin.confirmDeleteTitle') ?? 'Delete Product?',
      message: t('admin.confirmDeleteSubtitle') ?? 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: t('admin.deleteForever') ?? 'Delete',
      cancelText: t('common.cancel') ?? 'Cancel',
      type: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((item) => item.id !== id));
      toast.success(
        t('admin.success') ?? 'Success',
        t('admin.productDeleted') ?? 'Product deleted successfully'
      );
    } catch (error) {
      console.error('Delete failed', error);
      toast.error(
        t('admin.error') ?? 'Error',
        t('admin.productDeleteFailed') ?? 'Unable to delete product'
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => products, [products]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-brand-purple">{t('admin.manageProducts')}</h2>
          <p className="text-sm text-gray-600">{t('admin.manageProductsSubtitle')}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder={t('admin.searchProductsPlaceholder') ?? 'Search products'}
              className="w-full text-sm text-gray-700 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-purple px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            {t('admin.search')}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-500"
          >
            <PlusCircleIcon className="h-5 w-5" />
            {t('admin.addNewProduct')}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3">{t('admin.product')}</th>
                <th className="px-6 py-3">{t('admin.category')}</th>
                <th className="px-6 py-3">{t('admin.price')}</th>
                <th className="px-6 py-3">{t('admin.stock')}</th>
                <th className="px-6 py-3">{t('admin.status')}</th>
                <th className="px-6 py-3">Landing Page</th>
                <th className="px-6 py-3 text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    {t('admin.noProducts')}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.thumbnailUrl ? (
                          <img
                            src={product.thumbnailUrl}
                            alt={product.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                            {t('admin.noImage')}
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">SKU: {product.sku || t('admin.notAvailable')}</p>
                          {product.landingPageEnabled ? (
                            <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-orange-600">
                              Landing Page
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.categoryName || t('admin.notAssigned')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{formatCurrency(product.regularPrice)}</span>
                        {product.salePrice ? (
                          <span className="text-xs text-brand-orange">
                            {t('admin.salePriceShort')}: {formatCurrency(product.salePrice)}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          product.stockQuantity > 0
                            ? 'rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700'
                            : 'rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700'
                        }
                      >
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          product.isPublished
                            ? 'rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-brand-purple'
                            : 'rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500'
                        }
                      >
                        {product.isPublished ? t('admin.published') : t('admin.draft')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <ToggleSwitch
                          checked={product.landingPageEnabled ?? false}
                          onChange={() => handleToggleLandingPage(product.id)}
                          size="sm"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(product.id)}
                          className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-brand-purple hover:text-brand-purple"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          {t('admin.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(product.id)}
                          className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                          {t('admin.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-6xl rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-brand-purple to-purple-600 px-8 py-6 rounded-t-2xl">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {selectedProduct ? t('admin.editProduct') : t('admin.createProduct')}
                </h3>
                <p className="text-sm text-purple-100 mt-1">{t('admin.productFormSubtitle')}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="rounded-full p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={submitForm} className="max-h-[calc(100vh-12rem)] overflow-y-auto px-8 py-6">
              <div className="grid gap-8">
                {/* Basic Information */}
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-brand-purple/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">{t('admin.basicInformation')}</h4>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {t('admin.productName')} <span className="text-red-500">*</span>
                      </span>
                      <input
                        value={formData.name}
                        onChange={(event) => handleFormChange('name', event.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                        placeholder={t('admin.productNamePlaceholder') ?? 'Baby product'}
                        required
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {t('admin.slug')} <span className="text-red-500">*</span>
                      </span>
                      <input
                        value={formData.slug}
                        onChange={(event) => handleFormChange('slug', event.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                        placeholder="product-slug"
                        required
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {t('admin.category')} <span className="text-red-500">*</span>
                      </span>
                      <select
                        value={formData.categoryId}
                        onChange={(event) => handleFormChange('categoryId', event.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                        required
                      >
                        <option value="">{t('admin.selectCategory')}</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-gray-700">SKU</span>
                      <input
                        value={formData.sku}
                        onChange={(event) => handleFormChange('sku', event.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                        placeholder="SKU-001"
                      />
                    </label>
                  </div>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-gray-700">{t('admin.shortDescription')}</span>
                    <textarea
                      value={formData.shortDescription}
                      onChange={(event) => handleFormChange('shortDescription', event.target.value)}
                      rows={2}
                      className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                      placeholder={t('admin.shortDescriptionPlaceholder') ?? 'A quick summary of the product'}
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-gray-700">{t('admin.longDescription')}</span>
                    <textarea
                      value={formData.longDescription}
                      onChange={(event) => handleFormChange('longDescription', event.target.value)}
                      rows={4}
                      className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                      placeholder={t('admin.longDescriptionPlaceholder') ?? 'Describe features, materials, care instructions...'}
                    />
                  </label>
                </section>

                {/* Pricing & Inventory */}
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">{t('admin.pricingInventory')}</h4>
                  </div>
                  
                  {/* Product Type Selection */}
                  <div className="mb-6">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        Product Type <span className="text-red-500">*</span>
                      </span>
                      <select
                        value={formData.productType}
                        onChange={(event) => handleFormChange('productType', event.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                      >
                        <option value="PHYSICAL">Physical Product</option>
                        <option value="DIGITAL">Digital Product</option>
                        <option value="PDF">PDF Document</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-5 md:grid-cols-3">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {t('admin.regularPrice')}
                        {formData.productType !== 'PDF' ? (
                          <>
                            {' '}
                            <span className="text-red-500">*</span>
                          </>
                        ) : null}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.regularPrice}
                        onChange={(event) => handleFormChange('regularPrice', event.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                        required={formData.productType !== 'PDF'}
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-gray-700">{t('admin.salePrice')}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.salePrice}
                        onChange={(event) => handleFormChange('salePrice', event.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {t('admin.stockQuantity')} <span className="text-red-500">*</span>
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={formData.stockQuantity}
                        onChange={(event) => handleFormChange('stockQuantity', event.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                        required
                      />
                    </label>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-gray-700">{t('admin.badgeLabel')}</span>
                      <input
                        value={formData.badgeLabel}
                        onChange={(event) => handleFormChange('badgeLabel', event.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                        placeholder={t('admin.badgePlaceholder') ?? 'Sale, New, Best Seller'}
                      />
                    </label>
                    <div className="grid gap-2.5">
                      <span className="text-sm font-medium text-gray-700">{t('admin.thumbnailImage')}</span>
                      <div className="flex items-start gap-4">
                        <div className="relative h-40 w-40 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                          <img
                            src={thumbnailPreview || formData.thumbnailUrl || placeholderImage}
                            alt={formData.name || 'thumbnail'}
                            className="h-full w-full object-cover"
                          />
                          {isThumbnailUploading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
                              <ArrowPathIcon className="h-7 w-7 animate-spin" />
                              <span className="mt-2 text-xs font-semibold">{t('common.uploading') ?? 'Uploading...'}</span>
                            </div>
                          ) : null}
                        </div>
                        <div className="flex flex-col gap-2.5">
                          <input
                            id="thumbnail-upload"
                            type="file"
                            accept="image/*"
                            onChange={onThumbnailFileChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="thumbnail-upload"
                            className="inline-flex items-center justify-center rounded-lg border border-brand-purple bg-white px-4 py-2.5 text-sm font-medium text-brand-purple transition hover:bg-brand-purple hover:text-white cursor-pointer shadow-sm"
                          >
                            {formData.thumbnailUrl ? t('admin.changeImage') : t('admin.uploadImage')}
                          </label>
                          {formData.thumbnailUrl ? (
                            <button
                              type="button"
                              onClick={removeThumbnail}
                              className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 shadow-sm"
                            >
                              {t('admin.removeImage')}
                            </button>
                          ) : null}
                          <p className="text-xs text-gray-600 max-w-[220px] leading-relaxed">
                            {t('admin.thumbnailHelper') ?? 'Upload a featured image shown in listings.'}
                          </p>
                          {formData.thumbnailUrl ? (
                            <p className="max-w-[220px] break-all text-xs text-gray-500 bg-gray-100 p-2 rounded">
                              {formData.thumbnailUrl}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(event) => handleFormChange('isPublished', event.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                    />
                    <span className="text-sm font-medium text-gray-700">{t('admin.publishProductLabel')}</span>
                  </label>
                  <label className="mt-3 flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={formData.landingPageEnabled}
                      onChange={(event) => handleFormChange('landingPageEnabled', event.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {t('admin.enableLandingPage') ?? 'Bật giao diện landing page'}
                    </span>
                  </label>
                  <p className="pl-7 text-xs text-gray-500">
                    {t('admin.enableLandingPageHelper') ?? 'Khi bật, trang chi tiết sẽ hiển thị giao diện landing page tùy chỉnh.'}
                  </p>
                </section>

                {/* Product Media */}
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                        <PhotoIcon className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">
                          {t('admin.productGallery') ?? 'Product Gallery'}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {t('admin.productGalleryHelper') ?? 'Upload multiple images to showcase this product.'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <input
                        id="product-gallery-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMediaFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="product-gallery-upload"
                        className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-brand-purple bg-white px-4 py-2.5 text-sm font-medium text-brand-purple transition hover:bg-brand-purple hover:text-white shadow-sm"
                      >
                        {t('admin.addImages') ?? 'Add images'}
                      </label>
                    </div>
                  </div>

                  {formData.media.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/70 p-10 text-center text-sm text-gray-500">
                      {t('admin.noProductImages') ?? 'No gallery images yet. Click "Add images" to begin.'}
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {formData.media.map((mediaItem, index) => {
                        const previewSrc = mediaItem.previewUrl || mediaItem.imageUrl || placeholderImage;
                        const clientId = mediaItem.clientId ?? mediaItem.sourceVariantKey ?? `media-${index}`;
                        return (
                          <div
                            key={clientId}
                            className="flex h-full flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                          >
                            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                              <img
                                src={previewSrc}
                                alt={mediaItem.altText || formData.name || 'product-media'}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute bottom-2 left-2">
                                <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-700">
                                  #{mediaItem.displayOrder}
                                </span>
                              </div>
                              {mediaItem.isPrimary ? (
                                <span className="absolute top-2 left-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                  {t('admin.primaryImage') ?? 'Primary'}
                                </span>
                              ) : null}
                              {mediaItem.isUploading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
                                  <ArrowPathIcon className="h-6 w-6 animate-spin" />
                                  <span className="mt-1 text-xs font-semibold">
                                    {t('common.uploading') ?? 'Uploading...'}
                                  </span>
                                </div>
                              ) : null}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => setPrimaryMediaItem(clientId)}
                                className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-brand-purple hover:text-brand-purple disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={mediaItem.isPrimary || mediaItem.isUploading}
                              >
                                {mediaItem.isPrimary
                                  ? t('admin.primaryImage') ?? 'Primary'
                                  : t('admin.setPrimary') ?? 'Set primary'}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeMediaItem(clientId)}
                                className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={mediaItem.isUploading}
                              >
                                <TrashIcon className="h-4 w-4" />
                                {t('admin.removeImage')}
                              </button>
                            </div>
                            <label className="grid gap-1">
                              <span className="text-xs font-medium text-gray-600">
                                {t('admin.altText') ?? 'Alt text'}
                              </span>
                              <input
                                value={mediaItem.altText}
                                onChange={(event) => updateMediaAltText(clientId, event.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                                placeholder={t('admin.altTextPlaceholder') ?? 'Describe this image'}
                              />
                            </label>
                            {mediaItem.imageUrl ? (
                              <p className="line-clamp-2 break-all rounded bg-gray-100 p-2 text-[11px] text-gray-500">
                                {mediaItem.imageUrl}
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* PDF Product Fields */}
                {formData.productType === 'PDF' && (
                  <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">PDF Document Settings</h4>
                    </div>
                    
                    {/* PDF File Upload Section */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Upload PDF File <span className="text-red-500">*</span>
                        </span>
                        <div className="flex gap-3 items-start">
                          <input
                            id="pdf-file-upload"
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={handlePdfFileUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="pdf-file-upload"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-brand-purple bg-white px-6 py-3 text-sm font-medium text-brand-purple transition hover:bg-brand-purple hover:text-white cursor-pointer"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            {isPdfUploading ? 'Uploading...' : 'Choose PDF File'}
                          </label>
                          {formData.fileUrl && (
                            <button
                              type="button"
                              onClick={removePdfFile}
                              className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Remove File
                            </button>
                          )}
                        </div>
                      </label>
                      
                      {isPdfUploading && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-purple transition-all duration-300"
                                style={{ width: `${pdfUploadProgress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{pdfUploadProgress}%</span>
                          </div>
                          <p className="text-xs text-gray-600">Uploading PDF file...</p>
                        </div>
                      )}
                      
                      {formData.fileUrl && !isPdfUploading && (
                        <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">File uploaded successfully</p>
                              <p className="text-xs text-gray-500 truncate">{formData.fileUrl}</p>
                              {formData.fileSize && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Size: {formData.fileSize} • Pages: {formData.pageCount || 'N/A'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-600 mt-2">
                        Max file size: 50MB. Only PDF files are accepted.
                      </p>
                    </div>
                    
                    <div className="grid gap-5 md:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          File URL <span className="text-red-500">*</span>
                        </span>
                        <input
                          value={formData.fileUrl}
                          onChange={(event) => handleFormChange('fileUrl', event.target.value)}
                          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                          placeholder="/files/sample-guide.pdf"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-gray-700">File Size</span>
                        <input
                          value={formData.fileSize}
                          onChange={(event) => handleFormChange('fileSize', event.target.value)}
                          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                          placeholder="2.5 MB"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-gray-700">Page Count</span>
                        <input
                          type="number"
                          min="0"
                          value={formData.pageCount}
                          onChange={(event) => handleFormChange('pageCount', event.target.value)}
                          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                          placeholder="25"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-gray-700">File Format</span>
                        <input
                          value={formData.fileFormat}
                          onChange={(event) => handleFormChange('fileFormat', event.target.value)}
                          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                          placeholder="PDF"
                        />
                      </label>
                    </div>
                    
                    <div className="mt-5 space-y-3">
                      <label className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={formData.isDownloadable}
                          onChange={(event) => handleFormChange('isDownloadable', event.target.checked)}
                          className="h-5 w-5 rounded border-gray-300 text-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                        />
                        <span className="text-sm font-medium text-gray-700">Enable Download</span>
                      </label>
                      
                      <label className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={formData.requiresLogin}
                          onChange={(event) => handleFormChange('requiresLogin', event.target.checked)}
                          className="h-5 w-5 rounded border-gray-300 text-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                          disabled={!formData.isDownloadable}
                        />
                        <span className="text-sm font-medium text-gray-700">Require Login to Download</span>
                      </label>
                    </div>
                    
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> For PDF products you can leave Regular Price empty and it will default to 0 for free downloads. 
                        Users will need to log in before downloading if "Require Login" is enabled.
                      </p>
                    </div>
                  </section>
                )}

                {/* Product Variants */}
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-gray-800">{t('admin.productVariants')}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="flex items-center gap-2 rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 shadow-sm"
                    >
                      <PlusIcon className="h-5 w-5" />
                      {t('admin.addVariant')}
                    </button>
                  </div>
                  {formData.variants.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-gray-100 p-3">
                          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">{t('admin.noVariantsYet')}</p>
                        <p className="text-xs text-gray-400 max-w-sm">{t('admin.noVariantsHelper') ?? 'Click "Add Variant" to create product variants like sizes, colors, or combos.'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {formData.variants.map((variant, index) => (
                        <div key={index} className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm transition hover:shadow-md">
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="grid gap-2">
                              <span className="text-sm font-medium text-gray-700">{t('admin.variantName')}</span>
                              <input
                                value={variant.name}
                                onChange={(event) => updateVariant(index, 'name', event.target.value)}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                                placeholder="Size M, Combo 2"
                              />
                            </label>
                            <label className="grid gap-2">
                              <span className="text-sm font-medium text-gray-700">SKU</span>
                              <input
                                value={variant.sku}
                                onChange={(event) => updateVariant(index, 'sku', event.target.value)}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                              />
                            </label>
                          </div>
                          <div className="grid gap-4 md:grid-cols-3">
                            <label className="grid gap-2">
                              <span className="text-sm font-medium text-gray-700">{t('admin.price')}</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={variant.price}
                                onChange={(event) => updateVariant(index, 'price', event.target.value)}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                              />
                            </label>
                            <label className="grid gap-2">
                              <span className="text-sm font-medium text-gray-700">{t('admin.stock')}</span>
                              <input
                                type="number"
                                min="0"
                                value={variant.stockQuantity}
                                onChange={(event) => updateVariant(index, 'stockQuantity', event.target.value)}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                              />
                            </label>
                            <div className="grid gap-2">
                              <span className="text-sm font-medium text-gray-700">{t('admin.imageUrl')}</span>
                              <div className="flex items-start gap-3">
                                <div className="relative h-28 w-28 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-white shadow-inner">
                                  {variant.previewUrl || variant.imageUrl ? (
                                    <img
                                      src={variant.previewUrl || variant.imageUrl}
                                      alt={variant.name || `variant-${index}`}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-gray-400">
                                      <PhotoIcon className="h-7 w-7" />
                                      <span className="text-xs font-medium">{t('admin.noImage')}</span>
                                    </div>
                                  )}
                                  {variant.isUploading ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
                                      <ArrowPathIcon className="h-6 w-6 animate-spin" />
                                      <span className="mt-1 text-xs font-semibold">{t('common.uploading') ?? 'Uploading...'}</span>
                                    </div>
                                  ) : null}
                                </div>
                                <div className="flex flex-col gap-2">
                                  <input
                                    id={`variant-image-${variant.clientId}`}
                                    type="file"
                                    accept="image/*"
                                    onChange={onVariantFileChange(index)}
                                    className="hidden"
                                  />
                                  <label
                                    htmlFor={`variant-image-${variant.clientId}`}
                                    className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-brand-purple bg-white px-4 py-2.5 text-sm font-medium text-brand-purple transition hover:bg-brand-purple hover:text-white shadow-sm"
                                  >
                                    {variant.imageUrl ? t('admin.changeImage') : t('admin.uploadImage')}
                                  </label>
                                  {variant.imageUrl ? (
                                    <button
                                      type="button"
                                      onClick={() => removeVariantImage(index)}
                                      className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 shadow-sm"
                                      disabled={variant.isUploading}
                                    >
                                      {t('admin.removeImage')}
                                    </button>
                                  ) : (
                                    <p className="max-w-[200px] text-xs text-gray-500 leading-relaxed">
                                      {t('admin.imageUploadHint') ?? 'Upload JPG, PNG up to 5MB.'}
                                    </p>
                                  )}
                                  {variant.imageUrl ? (
                                    <p className="max-w-[200px] break-all text-xs text-gray-500 bg-gray-100 p-2 rounded">{variant.imageUrl}</p>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                          <label className="grid gap-2">
                            <span className="text-sm font-medium text-gray-700">{t('admin.attributesJson')}</span>
                            <textarea
                              value={variant.attributes}
                              onChange={(event) => updateVariant(index, 'attributes', event.target.value)}
                              rows={3}
                              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 font-mono outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20"
                              placeholder='{"color":"Lavender","package":"Combo 2"}'
                            />
                          </label>
                          <div className="flex justify-end pt-2 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                            >
                              <TrashIcon className="h-4 w-4" />
                              {t('admin.removeVariant')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-200 bg-white/95 backdrop-blur-sm py-5 -mx-8 px-8 rounded-b-2xl shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm();
                    }}
                    className="rounded-lg border-2 border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 shadow-sm"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-gradient-to-r from-brand-purple to-purple-600 px-8 py-2.5 text-sm font-semibold text-white transition hover:from-purple-700 hover:to-purple-800 shadow-md"
                  >
                    {selectedProduct ? t('admin.saveChanges') : t('admin.createProduct')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Confirmation Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default Products;
