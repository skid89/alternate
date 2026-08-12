import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createSession, verifyAndGetSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/login?error=' + error, req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', req.url));
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Discord OAuth credentials not configured.');
    return NextResponse.redirect(new URL('/login?error=oauth_configuration', req.url));
  }

  try {
    // 1. Exchange code for Access Token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error('Discord Token exchange failed:', errBody);
      return NextResponse.redirect(new URL('/login?error=token_exchange', req.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch User Profile Info from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL('/login?error=user_fetch', req.url));
    }

    const discordUser = await userResponse.json();
    const discordId = discordUser.id;
    const discordUsername = discordUser.username;
    const discordEmail = discordUser.email; // Requires 'email' scope

    // Check if user is already logged in (Linking scenario)
    const activeSession = await verifyAndGetSession();

    if (activeSession) {
      // LINKING DISCORD TO ACTIVE USER
      // Check if this Discord ID is already linked to someone else
      const existingLink = await prisma.profile.findFirst({
        where: { discordId, NOT: { userId: activeSession.userId } }
      });

      if (existingLink) {
        return NextResponse.redirect(new URL('/dashboard/integrations?error=discord_already_linked', req.url));
      }

      // Update active user's profile with discordId and create social link if not present
      await prisma.profile.update({
        where: { userId: activeSession.userId },
        data: { discordId }
      });

      // Check if a discord social link already exists
      const existingSocial = await prisma.social.findFirst({
        where: { profileId: activeSession.id, platform: 'discord' }
      });

      if (!existingSocial) {
        await prisma.social.create({
          data: {
            profileId: activeSession.id,
            platform: 'discord',
            value: discordUsername
          }
        });
      }

      return NextResponse.redirect(new URL('/dashboard/integrations?success=discord_linked', req.url));
    } else {
      // LOGGING IN OR SIGNING UP VIA DISCORD
      // Find profile linked with this Discord ID
      let profile = await prisma.profile.findFirst({
        where: { discordId },
        include: { user: true }
      });

      let userToLogin = profile?.user;

      if (!userToLogin && discordEmail) {
        // If not found by Discord ID, check if a user exists with the same email address
        userToLogin = await prisma.user.findUnique({
          where: { email: discordEmail },
          include: { profile: true }
        }) || undefined;

        if (userToLogin) {
          // Link this discord ID to the existing user's profile
          await prisma.profile.update({
            where: { userId: userToLogin.id },
            data: { discordId }
          });
        }
      }

      if (!userToLogin) {
        // AUTO-CREATE ACCOUNT (New Sign-Up via Discord)
        // Construct unique username based on Discord tag
        let uniqueUsername = discordUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (uniqueUsername.length < 3) uniqueUsername = 'user_' + uniqueUsername;
        
        // Ensure username is unique in database
        const usernameCheck = await prisma.user.findUnique({ where: { username: uniqueUsername } });
        if (usernameCheck) {
          uniqueUsername = uniqueUsername + '_' + Math.floor(100 + Math.random() * 900);
        }

        const randomPassword = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const passwordHash = await require('bcryptjs').hash(randomPassword, 10);

        userToLogin = await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              username: uniqueUsername,
              email: discordEmail || `${uniqueUsername}@alternate.lol`,
              passwordHash
            }
          });

          await tx.profile.create({
            data: {
              userId: user.id,
              slug: uniqueUsername,
              displayName: discordUsername,
              discordId,
              bio: `Hello! I joined Alternate via Discord.`,
              layout: 'DEFAULT',
              socials: {
                create: [
                  { platform: 'discord', value: discordUsername, order: 0 }
                ]
              }
            }
          });

          return user;
        });
      }

      // Log the user in
      const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || undefined;
      const userAgent = req.headers.get('user-agent') || undefined;
      await createSession(userToLogin.id, ipAddress, userAgent);

      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

  } catch (err) {
    console.error('Error during Discord callback handling:', err);
    return NextResponse.redirect(new URL('/login?error=callback_exception', req.url));
  }
}
