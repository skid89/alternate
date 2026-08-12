import { NextRequest, NextResponse } from 'next/server';
import { verifyAndGetSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateAndUploadFile } from '@/lib/storage';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAndGetSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get user details for premium tier limits
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Compute storage used
    let currentUsedStorage = 0;
    const provider = process.env.STORAGE_PROVIDER || 'local';
    if (provider === 'local') {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        for (const f of files) {
          if (f.startsWith(session.userId)) {
            const stats = fs.statSync(path.join(uploadDir, f));
            currentUsedStorage += stats.size;
          }
        }
      }
    }

    // Call storage validation & upload helper
    const uploadResult = await validateAndUploadFile(
      file,
      session.userId,
      user.premiumStatus,
      currentUsedStorage
    );

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      key: uploadResult.key,
      size: uploadResult.size
    });

  } catch (error: any) {
    console.error('File upload API error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred during file upload' }, { status: 400 });
  }
}
