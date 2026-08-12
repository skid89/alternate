import { PremiumStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Quota configuration per plan
export const PLAN_LIMITS = {
  [PremiumStatus.FREE]: {
    maxSize: 5 * 1024 * 1024,       // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    quotaTotal: 10 * 1024 * 1024,   // 10MB total quota
  },
  [PremiumStatus.PREMIUM]: {
    maxSize: 25 * 1024 * 1024,      // 25MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/wav', 'audio/ogg'],
    quotaTotal: 100 * 1024 * 1024,  // 100MB total quota
  },
  [PremiumStatus.LIFETIME]: {
    maxSize: 100 * 1024 * 1024,     // 100MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/wav', 'audio/ogg'],
    quotaTotal: 500 * 1024 * 1024,  // 500MB total quota
  },
  [PremiumStatus.CREATOR]: {
    maxSize: 100 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/wav', 'audio/ogg'],
    quotaTotal: 1000 * 1024 * 1024, // 1GB
  },
  [PremiumStatus.VERIFIED]: {
    maxSize: 50 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/wav', 'audio/ogg'],
    quotaTotal: 250 * 1024 * 1024,
  }
};

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

export async function validateAndUploadFile(
  file: File,
  userId: string,
  premiumStatus: PremiumStatus,
  currentUsedStorage: number
): Promise<UploadResult> {
  const limits = PLAN_LIMITS[premiumStatus] || PLAN_LIMITS[PremiumStatus.FREE];

  // 1. Check file size
  if (file.size > limits.maxSize) {
    throw new Error(`File is too large. Maximum size for your plan is ${limits.maxSize / (1024 * 1024)}MB.`);
  }

  // 2. Check total storage quota
  if (currentUsedStorage + file.size > limits.quotaTotal) {
    throw new Error('Storage quota exceeded. Please upgrade or delete existing media assets.');
  }

  // 3. Check mime types
  if (!limits.allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed on your plan.`);
  }

  // 4. Validate extension
  const ext = path.extname(file.name).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp3', '.wav', '.ogg'];
  if (!allowedExtensions.includes(ext)) {
    throw new Error('Unsupported file extension.');
  }

  const fileName = `${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;

  // Check storage provider
  const provider = process.env.STORAGE_PROVIDER || 'local';

  if (provider === 'local') {
    // Local fallback for development (stored under public/uploads)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    return {
      url: `/uploads/${fileName}`,
      key: fileName,
      size: file.size
    };
  } else if (provider === 'supabase') {
    // Supabase upload logic
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'alternate-media';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase storage parameters are not configured in environment variables.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    const formData = new FormData();
    formData.append('cacheControl', '3600');
    formData.append('content-type', file.type);
    formData.append('', blob, fileName);

    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${fileName}`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Supabase upload failed: ${errText}`);
    }

    return {
      url: `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`,
      key: fileName,
      size: file.size
    };
  }

  throw new Error('Invalid storage provider configured.');
}

export async function deleteUploadedFile(key: string): Promise<boolean> {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  if (provider === 'local') {
    const filePath = path.join(process.cwd(), 'public', 'uploads', key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } else if (provider === 'supabase') {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'alternate-media';

    if (!supabaseUrl || !supabaseKey) return false;

    const deleteUrl = `${supabaseUrl}/storage/v1/object/${bucketName}`;
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefixes: [key] })
    });

    return response.ok;
  }

  return false;
}
