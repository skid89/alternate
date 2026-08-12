export interface DiscordPresence {
  status: 'online' | 'idle' | 'dnd' | 'offline';
  username: string;
  discriminator: string;
  avatar: string;
  customStatus?: string;
  activities: Array<{
    name: string;
    type: number;
    details?: string;
    state?: string;
    timestamps?: { start?: number; end?: number };
    assets?: { large_image?: string; large_text?: string; small_image?: string };
  }>;
  spotify?: {
    song: string;
    artist: string;
    album: string;
    album_art_url: string;
    timestamps: { start: number; end: number };
  };
}

export interface RobloxPresence {
  presenceType: number; // 0: Offline, 1: Online, 2: InGame, 3: InStudio
  lastLocation: string;
  placeId: number | null;
  gameId: string | null;
  universeId: number | null;
  lastOnline: string;
}

export async function getDiscordPresence(discordUserId: string): Promise<DiscordPresence | null> {
  if (!discordUserId) return null;
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`, {
      next: { revalidate: 15 } // cache for 15 seconds
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data) return null;

    const data = json.data;
    
    // Extract custom status from activities
    const customAct = data.activities?.find((a: any) => a.type === 4);
    const customStatus = customAct ? [customAct.emoji?.name, customAct.state].filter(Boolean).join(' ') : undefined;

    return {
      status: data.discord_status || 'offline',
      username: data.discord_user.username,
      discriminator: data.discord_user.discriminator,
      avatar: `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png`,
      customStatus,
      activities: data.activities || [],
      spotify: data.listening_to_spotify ? {
        song: data.spotify.song,
        artist: data.spotify.artist,
        album: data.spotify.album,
        album_art_url: data.spotify.album_art_url,
        timestamps: data.spotify.timestamps
      } : undefined
    };
  } catch (error) {
    console.error('Error fetching Discord presence from Lanyard:', error);
    return null;
  }
}

export async function getRobloxPresence(robloxUserId: string): Promise<RobloxPresence | null> {
  if (!robloxUserId) return null;
  try {
    const res = await fetch('https://presence.roblox.com/v1/presence/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds: [parseInt(robloxUserId, 10)] }),
      next: { revalidate: 30 } // cache for 30 seconds
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.userPresences || json.userPresences.length === 0) return null;

    const presence = json.userPresences[0];
    return {
      presenceType: presence.userPresenceType,
      lastLocation: presence.lastLocation,
      placeId: presence.placeId,
      gameId: presence.gameId,
      universeId: presence.universeId,
      lastOnline: presence.lastOnline
    };
  } catch (error) {
    console.error('Error fetching Roblox presence:', error);
    return null;
  }
}
