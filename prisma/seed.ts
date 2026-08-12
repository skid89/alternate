import { PrismaClient, Role, PremiumStatus, LayoutType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Default Badges
  const badgesData = [
    { name: 'Staff', description: 'Alternate official team member', icon: 'ShieldAlert', color: '#EF4444', rarity: 'mythic' },
    { name: 'Developer', description: 'Alternate core developer', icon: 'Code', color: '#10B981', rarity: 'legendary' },
    { name: 'Verified', description: 'Verified public figure or celebrity', icon: 'CheckCircle', color: '#3B82F6', rarity: 'rare' },
    { name: 'Premium', description: 'Alternate Premium Subscriber', icon: 'Crown', color: '#F59E0B', rarity: 'rare' },
    { name: 'Supporter', description: 'Early community supporter', icon: 'Heart', color: '#EC4899', rarity: 'uncommon' },
    { name: 'Partner', description: 'Official Alternate partner', icon: 'Handshake', color: '#8B5CF6', rarity: 'uncommon' },
    { name: 'Early User', description: 'One of the first users on Alternate', icon: 'Sparkles', color: '#A78BFA', rarity: 'rare' },
    { name: 'Creator', description: 'Alternate content creator partner', icon: 'Video', color: '#EC4899', rarity: 'rare' }
  ];

  console.log('Creating badges...');
  const badgesMap = new Map();
  for (const b of badgesData) {
    const badge = await prisma.badge.upsert({
      where: { name: b.name },
      update: b,
      create: b
    });
    badgesMap.set(b.name, badge);
  }

  // Create Default Templates
  const templatesData = [
    {
      name: 'Default Violet',
      description: 'The classic Alternate layout. Clean dark cards, muted violet borders, and soft lavender glows.',
      layout: LayoutType.DEFAULT,
      isPremium: false,
      configJson: JSON.stringify({
        primaryColor: '#ffffff',
        accentColor: '#8B5CF6',
        bgColor: '#000000',
        cardColor: '#0c0c0e',
        textColor: '#ffffff',
        textMutedColor: '#a1a1aa',
        borderGlowColor: '#8B5CF6',
        cardOpacity: 0.85,
        cardBlur: 10,
        cardRadius: 12,
        backgroundType: 'color',
        backgroundEffects: 'animated-gradient'
      })
    },
    {
      name: 'Ultra Minimalist',
      description: 'A barebones stark profile focused strictly on readability and clean spacing without card borders or glows.',
      layout: LayoutType.MINIMAL,
      isPremium: false,
      configJson: JSON.stringify({
        primaryColor: '#ffffff',
        accentColor: '#f4f4f5',
        bgColor: '#09090b',
        cardColor: 'transparent',
        textColor: '#ffffff',
        textMutedColor: '#71717a',
        borderGlowColor: 'transparent',
        cardOpacity: 1,
        cardBlur: 0,
        cardRadius: 0,
        backgroundType: 'color',
        backgroundEffects: 'none'
      })
    },
    {
      name: 'Premium Sleek',
      description: 'Highly polished glassmorphism style card layout with glowing badges and smooth floating background particles.',
      layout: LayoutType.SLEEK,
      isPremium: true,
      configJson: JSON.stringify({
        primaryColor: '#ffffff',
        accentColor: '#a78bfa',
        bgColor: '#020205',
        cardColor: '#11111b',
        textColor: '#ffffff',
        textMutedColor: '#94a3b8',
        borderGlowColor: '#a78bfa',
        cardOpacity: 0.7,
        cardBlur: 20,
        cardRadius: 16,
        backgroundType: 'gradient',
        backgroundEffects: 'particles'
      })
    }
  ];

  console.log('Creating templates...');
  for (const t of templatesData) {
    await prisma.template.upsert({
      where: { name: t.name },
      update: t,
      create: t
    });
  }

  // Create admin account (Password: admin123)
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  console.log('Creating Admin account (username: admin)...');
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.OWNER,
      premiumStatus: PremiumStatus.LIFETIME
    },
    create: {
      username: 'admin',
      email: 'admin@alternate.lol',
      passwordHash: adminPasswordHash,
      role: Role.OWNER,
      premiumStatus: PremiumStatus.LIFETIME
    }
  });

  // Assign Admin Badges
  const staffBadge = badgesMap.get('Staff');
  const devBadge = badgesMap.get('Developer');
  if (staffBadge && devBadge) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: admin.id, badgeId: staffBadge.id } },
      update: {},
      create: { userId: admin.id, badgeId: staffBadge.id, order: 0 }
    });
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: admin.id, badgeId: devBadge.id } },
      update: {},
      create: { userId: admin.id, badgeId: devBadge.id, order: 1 }
    });
  }

  // Create default Admin profile
  console.log('Creating Admin profile...');
  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      slug: 'admin',
      displayName: 'Alternate Admin',
      bio: 'Administrator and developer of Alternate.lol. Connect with me or report any system issues.',
      location: 'New Zealand',
      layout: LayoutType.DEFAULT,
      backgroundEffects: 'animated-gradient',
      discordPresenceEnabled: false,
      robloxPresenceEnabled: false,
      links: {
        create: [
          { title: 'Official Discord Server', url: 'https://discord.gg/alternate', order: 0, isLarge: true },
          { title: 'Status Page', url: '/status', order: 1, isLarge: false },
          { title: 'Explore Leaderboards', url: '/leaderboard', order: 2, isLarge: false }
        ]
      },
      socials: {
        create: [
          { platform: 'discord', value: 'alternate.lol', order: 0 },
          { platform: 'github', value: 'alternate-lol', order: 1 }
        ]
      }
    }
  });

  // Create mock demo user (Password: password123)
  const userPasswordHash = await bcrypt.hash('password123', 10);
  console.log('Creating demo user (username: demo)...');
  const demoUser = await prisma.user.upsert({
    where: { username: 'demo' },
    update: {
      passwordHash: userPasswordHash,
      role: Role.USER,
      premiumStatus: PremiumStatus.PREMIUM
    },
    create: {
      username: 'demo',
      email: 'demo@alternate.lol',
      passwordHash: userPasswordHash,
      role: Role.USER,
      premiumStatus: PremiumStatus.PREMIUM
    }
  });

  // Assign Premium and Verified Badge to Demo user
  const premiumBadge = badgesMap.get('Premium');
  const verifiedBadge = badgesMap.get('Verified');
  if (premiumBadge && verifiedBadge) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: demoUser.id, badgeId: premiumBadge.id } },
      update: {},
      create: { userId: demoUser.id, badgeId: premiumBadge.id, order: 0 }
    });
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: demoUser.id, badgeId: verifiedBadge.id } },
      update: {},
      create: { userId: demoUser.id, badgeId: verifiedBadge.id, order: 1 }
    });
  }

  // Create demo profile
  console.log('Creating demo profile...');
  await prisma.profile.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      slug: 'demo',
      displayName: 'Demo Profile',
      bio: 'Welcome to my official profile page! Built premium with Alternate.lol. Check my socials below!',
      location: 'Cyberspace',
      layout: LayoutType.SLEEK,
      backgroundType: 'gradient',
      backgroundEffects: 'particles',
      accentColor: '#A78BFA',
      cardRadius: 16,
      borderGlowColor: '#8B5CF6',
      links: {
        create: [
          { title: 'My Personal Website', url: 'https://example.com', order: 0, isLarge: true },
          { title: 'Buy Alternate Premium', url: '/#pricing', order: 1, isLarge: false }
        ]
      },
      socials: {
        create: [
          { platform: 'discord', value: 'scarlistic', order: 0 },
          { platform: 'tiktok', value: '67fovkoni', order: 1 },
          { platform: 'github', value: 'misanthropistic', order: 2 }
        ]
      }
    }
  });

  // Create mock analytics for demo
  console.log('Creating mock analytics...');
  const countries = ['NZ', 'US', 'GB', 'AU', 'CA', 'DE', 'FR'];
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
  const osList = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];
  const devices = ['desktop', 'mobile', 'tablet'];

  for (let i = 0; i < 150; i++) {
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * 14));
    
    await prisma.analyticsEvent.create({
      data: {
        slug: 'demo',
        type: Math.random() > 0.8 ? 'click' : 'view',
        target: Math.random() > 0.5 ? 'link-id-1' : null,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254)}`,
        country: countries[Math.floor(Math.random() * countries.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        os: osList[Math.floor(Math.random() * osList.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        referrer: Math.random() > 0.4 ? 'https://google.com' : 'direct',
        timestamp
      }
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
