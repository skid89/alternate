import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAndGetSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAndGetSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await req.json();

    // Whitelist allow update fields
    const {
      displayName,
      bio,
      location,
      entryText,
      layout,
      font,
      primaryColor,
      accentColor,
      bgColor,
      cardColor,
      textColor,
      textMutedColor,
      borderGlowColor,
      cardOpacity,
      cardBlur,
      cardRadius,
      cardWidth,
      backgroundType,
      backgroundUrl,
      backgroundEffects,
      avatarUrl,
      avatarStyle,
      avatarDecoration,
      bannerUrl,
      musicUrl,
      musicAutoplay,
      musicVolume,
      musicTitle,
      musicArtist,
      cursorStyle,
      customCursor
    } = body;

    // Validate layout types
    const validLayouts = ['DEFAULT', 'MINIMAL', 'MODERN', 'SLEEK', 'PORTFOLIO', 'CARDS', 'COMPACT'];
    if (layout && !validLayouts.includes(layout)) {
      return NextResponse.json({ error: 'Invalid layout type selected.' }, { status: 400 });
    }

    // Validate numerical boundaries
    if (cardOpacity !== undefined && (cardOpacity < 0 || cardOpacity > 1)) {
      return NextResponse.json({ error: 'Card opacity must be between 0 and 1.' }, { status: 400 });
    }
    if (cardBlur !== undefined && (cardBlur < 0 || cardBlur > 100)) {
      return NextResponse.json({ error: 'Card blur must be between 0 and 100.' }, { status: 400 });
    }
    if (cardRadius !== undefined && (cardRadius < 0 || cardRadius > 100)) {
      return NextResponse.json({ error: 'Card border radius must be between 0 and 100.' }, { status: 400 });
    }
    if (musicVolume !== undefined && (musicVolume < 0 || musicVolume > 1)) {
      return NextResponse.json({ error: 'Audio volume must be between 0 and 100%.' }, { status: 400 });
    }

    // Perform database update
    const updatedProfile = await prisma.profile.update({
      where: { userId: session.userId },
      data: {
        displayName: displayName ? displayName.trim() : session.user.username,
        bio: bio ? bio.trim() : null,
        location: location ? location.trim() : null,
        entryText: entryText ? entryText.trim() : null,
        layout,
        font,
        primaryColor,
        accentColor,
        bgColor,
        cardColor,
        textColor,
        textMutedColor,
        borderGlowColor,
        cardOpacity,
        cardBlur,
        cardRadius,
        cardWidth,
        backgroundType,
        backgroundUrl,
        backgroundEffects,
        avatarUrl,
        avatarStyle,
        avatarDecoration,
        bannerUrl,
        musicUrl,
        musicAutoplay,
        musicVolume,
        musicTitle,
        musicArtist,
        cursorStyle,
        customCursor
      }
    });

    return NextResponse.json({ success: true, profile: updatedProfile });

  } catch (error: any) {
    console.error('Profile update API error:', error);
    return NextResponse.json({ error: 'An error occurred while updating customizations' }, { status: 500 });
  }
}
