'use client';

import React, { useEffect, useState } from 'react';
import { Star, ArrowUpRight, FolderGit2, Users, Activity } from 'lucide-react';
import { SiGithub } from 'react-icons/si';
import { updateSpotlightPos } from '@/lib/utils';

interface GithubPayload {
  source: 'live' | 'fallback';
  profile: {
    login: string;
    name: string;
    avatar_url: string;
    html_url: string;
    public_repos: number;
    followers: number;
    following: number;
  };
  totalStars: number;
  languages: Array<{ name: string; count: number; percent: number }>;
  activityBins: number[];
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  CSS: '#38BDF8',
  HTML: '#E34F26',
  PHP: '#777BB4',
  Python: '#3776AB',
};

const GITHUB_CACHE_TTL = 5 * 60_000;
let cachedGithubPayload: GithubPayload | null = null;
let cachedGithubAt = 0;

export function GithubActivityCard() {
  const [data, setData] = useState<GithubPayload | null>(() =>
    cachedGithubPayload && Date.now() - cachedGithubAt < GITHUB_CACHE_TTL ? cachedGithubPayload : null
  );
  const [loading, setLoading] = useState(() =>
    !(cachedGithubPayload && Date.now() - cachedGithubAt < GITHUB_CACHE_TTL)
  );

  useEffect(() => {
    if (cachedGithubPayload && Date.now() - cachedGithubAt < GITHUB_CACHE_TTL) {
      setData(cachedGithubPayload);
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch('/api/github')
      .then((res) => res.json())
      .then((json: GithubPayload) => {
        cachedGithubPayload = json;
        cachedGithubAt = Date.now();
        if (!cancelled) setData(json);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="p-6 sm:p-10 rounded-3xl bg-surface border border-hairline space-y-6 animate-pulse">
        <div className="h-6 w-52 bg-elevated rounded-lg" />
        <div className="h-28 rounded-2xl bg-elevated" />
      </section>
    );
  }

  if (!data) return null;

  return (
    <section
      onMouseMove={updateSpotlightPos}
      className="spotlight-border p-6 sm:p-10 rounded-3xl bg-surface border border-hairline space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-6">
        <div className="flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center">
            <SiGithub className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-semibold">
                Open Source &bull; GitHub Telemetry
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {data.source === 'live' ? 'Live API' : 'Cached'}
              </span>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-neutral-950 dark:text-white">
              @{data.profile.login} Activity Pulse
            </h2>
          </div>
        </div>

        <a
          href={data.profile.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-canvas border border-hairline hover:border-primary/50 text-xs font-mono font-semibold text-neutral-900 dark:text-white transition-all self-start sm:self-auto"
        >
          <SiGithub className="w-3.5 h-3.5" />
          <span>View Profile</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
        </a>
      </div>

      {/* Metrics + 28-Day Contribution Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-4 grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-canvas border border-hairline flex flex-col justify-between">
            <FolderGit2 className="w-4 h-4 text-primary" />
            <div className="mt-3">
              <p className="font-display text-2xl font-extrabold text-neutral-950 dark:text-white">
                {data.profile.public_repos}
              </p>
              <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">Repos</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-canvas border border-hairline flex flex-col justify-between">
            <Star className="w-4 h-4 text-primary" />
            <div className="mt-3">
              <p className="font-display text-2xl font-extrabold text-neutral-950 dark:text-white">
                {data.totalStars}
              </p>
              <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">Stars</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-canvas border border-hairline flex flex-col justify-between">
            <Users className="w-4 h-4 text-primary" />
            <div className="mt-3">
              <p className="font-display text-2xl font-extrabold text-neutral-950 dark:text-white">
                {data.profile.followers}
              </p>
              <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">Followers</p>
            </div>
          </div>
        </div>

        {/* 28-Day Activity Pulse & Language Bar */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-2xl bg-canvas border border-hairline flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span>28-Day Public Event Pulse</span>
              </span>
              <span>Recent Commits &amp; Pushes</span>
            </div>
            <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] sm:grid-cols-[repeat(28,minmax(0,1fr))] gap-1">
              {data.activityBins.map((level, i) => {
                const opacity =
                  level === 0 ? 0.12 : level === 1 ? 0.35 : level === 2 ? 0.58 : level === 3 ? 0.8 : 1;
                return (
                  <div
                    key={i}
                    title={`Day ${i + 1}: ${level} event(s)`}
                    className="h-6 rounded-[4px] transition-transform hover:scale-110"
                    style={{
                      backgroundColor:
                        level === 0
                          ? 'var(--color-elevated)'
                          : `rgba(var(--color-primary-rgb, 255, 90, 31), ${opacity})`,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Dominant Languages Bar */}
          <div className="space-y-2">
            <div className="h-2 w-full rounded-full overflow-hidden flex bg-elevated">
              {data.languages.map((lang) => (
                <div
                  key={lang.name}
                  style={{
                    width: `${lang.percent}%`,
                    backgroundColor: LANG_COLORS[lang.name] || 'var(--color-primary)',
                  }}
                  title={`${lang.name}: ${lang.percent}%`}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
              {data.languages.map((lang) => (
                <span key={lang.name} className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: LANG_COLORS[lang.name] || 'var(--color-primary)' }}
                  />
                  <span>
                    {lang.name} ({lang.percent}%)
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GithubActivityCard;
