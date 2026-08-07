"use client";

import React, { useRef, useState, useEffect } from "react";
import { MediaPlayerConfig } from "@/types/profile";
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, ListMusic, Repeat } from "lucide-react";

interface MediaPlayerProps {
  config: MediaPlayerConfig;
  onVolumeChange?: (vol: number) => void;
  // If embedded in a preview profile, standard configurations will update live
  onTrackChange?: (index: number) => void;
  isPreview?: boolean;
}

interface ParsedLyric {
  time: number; // in seconds
  text: string;
}

export default function MediaPlayer({ config, onVolumeChange, onTrackChange, isPreview = false }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(config.volume / 100);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(config.currentTrackIndex);
  const [showTrackList, setShowTrackList] = useState(false);
  const [lyrics, setLyrics] = useState<ParsedLyric[]>([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const tracks = config.trackList || [];
  const currentTrack = tracks[currentTrackIndex];

  // Parse .lrc lyrics format e.g. "[00:15] Chill lofi beats"
  useEffect(() => {
    if (!currentTrack || !currentTrack.lyrics) {
      setLyrics([]);
      setActiveLyricIndex(-1);
      return;
    }

    const lines = currentTrack.lyrics.split("\n");
    const parsed: ParsedLyric[] = [];

    lines.forEach((line) => {
      const match = line.match(/\[(\d+):(\d+)(?:\.(\d+))?\](.*)/);
      if (match) {
        const mins = parseInt(match[1]);
        const secs = parseInt(match[2]);
        const ms = match[3] ? parseInt(match[3]) : 0;
        const time = mins * 60 + secs + ms / 100;
        const text = match[4].trim();
        parsed.push({ time, text });
      }
    });

    // Sort by timestamp
    parsed.sort((a, b) => a.time - b.time);
    setLyrics(parsed);
  }, [currentTrackIndex, currentTrack]);

  // Synchronize active lyric index with audio time
  useEffect(() => {
    if (lyrics.length === 0) return;
    
    let index = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }
    setActiveLyricIndex(index);
  }, [currentTime, lyrics]);

  // Autoplay setting change
  useEffect(() => {
    if (config.autoplay && !isPreview && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [config.autoplay, currentTrackIndex, isPreview]);

  // Sync internal track index with config
  useEffect(() => {
    setCurrentTrackIndex(config.currentTrackIndex);
  }, [config.currentTrackIndex]);

  // Set audio source
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack?.url || "";
      if (isPlaying && !isPreview) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(false);
      }
    }
  }, [currentTrackIndex, isPreview]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    if (config.loop) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else {
      handleNext();
    }
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    if (onTrackChange) onTrackChange(nextIndex);
  };

  const handlePrev = () => {
    if (tracks.length === 0) return;
    const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    if (onTrackChange) onTrackChange(prevIndex);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const progress = progressRef.current;
    const audio = audioRef.current;
    if (!progress || !audio || duration === 0) return;

    const rect = progress.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeSlide = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    if (onVolumeChange) onVolumeChange(vol * 100);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!currentTrack) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-500 justify-center py-4">
        <Music className="w-4 h-4" /> No music tracks configured
      </div>
    );
  }

  // Accent and shadow glow styles
  const glowStyle = {
    boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 ${config.glowStrength}px ${config.progressColor}33`,
    borderColor: `${config.progressColor}25`,
  };

  return (
    <div
      className="w-full flex flex-col p-4 rounded-xl border relative transition-all duration-300"
      style={{
        backgroundColor: `${config.backgroundColor}${Math.round(config.backgroundOpacity * 255).toString(16).padStart(2, "0")}`,
        backdropFilter: `blur(${config.glassBlur}px)`,
        borderRadius: `${config.borderRadius}px`,
        color: config.textColor,
        ...glowStyle,
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      <div className="flex items-center gap-3">
        {/* Animated Rotating Vinyl Album Cover */}
        <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border border-white/10 group">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className={`w-full h-full object-cover transition-transform duration-1000 ${
              isPlaying ? "animate-spin [animation-duration:8s]" : ""
            }`}
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Music className="w-4 h-4 text-white" />
          </div>
          {/* Vinyl center dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-zinc-950 rounded-full border border-white/20" />
        </div>

        {/* Track Title and Artist details */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{currentTrack.title}</div>
          <div className="text-xs text-zinc-400 truncate">{currentTrack.artist}</div>
        </div>

        {/* Floating Side Control Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowTrackList(!showTrackList)}
            className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${
              showTrackList ? "text-pink-500" : "text-zinc-400"
            }`}
            title="Tracklist"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>



      {/* Progress Timeline Seeking and Timestamps */}
      <div className="mt-3 flex flex-col gap-1">
        <div
          ref={progressRef}
          onClick={handleSeek}
          className="h-1.5 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden relative"
        >
          <div
            className="h-full transition-all duration-100 ease-out"
            style={{
              width: `${duration ? (currentTime / duration) * 100 : 0}%`,
              backgroundColor: config.progressColor,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls: Playback buttons and volume bar */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handlePrev} className="text-zinc-300 hover:text-white transition-colors">
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            style={{ backgroundColor: config.progressColor }}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-black fill-black" />
            ) : (
              <Play className="w-4 h-4 text-black fill-black ml-0.5" />
            )}
          </button>
          <button onClick={handleNext} className="text-zinc-300 hover:text-white transition-colors">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume adjust slide-bar */}
        <div className="flex items-center gap-1.5 group/vol">
          <Volume2 className="w-3.5 h-3.5 text-zinc-400 group-hover/vol:text-white transition-colors" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeSlide}
            className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
            style={{ accentColor: config.progressColor }}
          />
        </div>
      </div>

      {/* Expandable playlist panel */}
      {showTrackList && (
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-1 max-h-32 overflow-y-auto">
          {tracks.map((t, idx) => (
            <div
              key={t.id}
              onClick={() => {
                setCurrentTrackIndex(idx);
                if (onTrackChange) onTrackChange(idx);
              }}
              className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                idx === currentTrackIndex ? "bg-white/10 text-pink-500 font-semibold" : "hover:bg-white/5 text-zinc-300"
              }`}
            >
              <span className="w-4 text-center">{idx + 1}</span>
              <span className="flex-1 truncate">{t.title} - {t.artist}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
