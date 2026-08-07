export type DiscordStatus = "online" | "idle" | "dnd" | "offline";

export interface LiveDiscordActivity {
  type: "spotify" | "game" | "custom" | "watching" | "streaming";
  name: string;
  details?: string;
  state?: string;
  imageUrl?: string;
}

export interface LiveDiscordPresence {
  username: string;
  displayName: string;
  avatarUrl: string;
  status: DiscordStatus;
  customStatus?: string;
  activity?: LiveDiscordActivity;
}

interface LanyardActivity {
  type: number;
  name: string;
  details?: string;
  state?: string;
  application_id?: string;
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
}

interface LanyardSpotify {
  song: string;
  artist: string;
  album: string;
  album_art_url: string;
}

interface LanyardResponse {
  success: boolean;
  data?: {
    discord_user: {
      id: string;
      username: string;
      global_name?: string | null;
      display_name?: string | null;
      avatar?: string | null;
    };
    discord_status: DiscordStatus;
    activities: LanyardActivity[];
    spotify?: LanyardSpotify | null;
  };
}

function discordAssetUrl(appId: string, asset: string): string {
  if (asset.startsWith("mp:external/")) {
    const hash = asset.replace("mp:external/", "").split("/").pop();
    return hash ? `https://media.discordapp.net/external/${hash}` : "";
  }
  if (asset.startsWith("spotify:")) {
    return `https://i.scdn.co/image/${asset.replace("spotify:", "")}`;
  }
  return `https://cdn.discordapp.com/app-assets/${appId}/${asset}.png`;
}

function mapActivity(activity: LanyardActivity): LiveDiscordActivity {
  let imageUrl: string | undefined;
  if (activity.assets?.large_image && activity.application_id) {
    imageUrl = discordAssetUrl(activity.application_id, activity.assets.large_image);
  }

  const typeMap: Record<number, LiveDiscordActivity["type"]> = {
    0: "game",
    1: "streaming",
    2: "game",
    3: "watching",
    4: "custom",
    5: "game",
  };

  return {
    type: typeMap[activity.type] ?? "game",
    name: activity.name,
    details: activity.details,
    state: activity.state,
    imageUrl,
  };
}

export function transformLanyardResponse(payload: LanyardResponse): LiveDiscordPresence | null {
  if (!payload.success || !payload.data) return null;

  const { discord_user, discord_status, activities, spotify } = payload.data;
  const avatarHash = discord_user.avatar;
  const avatarUrl = avatarHash
    ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${avatarHash}.png?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${Number(discord_user.id) % 5}.png`;

  const customActivity = activities.find((a) => a.type === 4);
  const customStatus = customActivity?.state || customActivity?.name;

  let activity: LiveDiscordActivity | undefined;

  if (spotify) {
    activity = {
      type: "spotify",
      name: spotify.song,
      details: spotify.artist,
      state: spotify.album,
      imageUrl: spotify.album_art_url,
    };
  } else {
    const nonCustom = activities.find((a) => a.type !== 4);
    if (nonCustom) {
      activity = mapActivity(nonCustom);
    }
  }

  return {
    username: discord_user.username,
    displayName: discord_user.global_name || discord_user.display_name || discord_user.username,
    avatarUrl,
    status: discord_status,
    customStatus,
    activity,
  };
}

export async function fetchDiscordPresence(userId: string): Promise<LiveDiscordPresence | null> {
  const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, {
    next: { revalidate: 15 },
  });

  if (!res.ok) return null;

  const payload = (await res.json()) as LanyardResponse;
  return transformLanyardResponse(payload);
}
