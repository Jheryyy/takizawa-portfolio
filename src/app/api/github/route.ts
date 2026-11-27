import { NextResponse } from 'next/server';

export const revalidate = 3600;

const GITHUB_USERNAME = 'Jheryyy';

interface GithubRepoSummary {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  fork: boolean;
}

const FALLBACK_DATA = {
  source: 'fallback' as const,
  profile: {
    login: GITHUB_USERNAME,
    name: 'Jheryco Takizawa',
    avatar_url: '',
    html_url: `https://github.com/${GITHUB_USERNAME}`,
    public_repos: 12,
    followers: 0,
    following: 0,
  },
  totalStars: 0,
  languages: [
    { name: 'TypeScript', count: 5, percent: 45 },
    { name: 'JavaScript', count: 3, percent: 27 },
    { name: 'CSS', count: 2, percent: 18 },
    { name: 'PHP', count: 1, percent: 10 },
  ],
  activityBins: [1, 2, 0, 3, 2, 4, 1, 2, 3, 1, 0, 2, 4, 3, 2, 1, 2, 3, 4, 2, 1, 3, 2, 4, 3, 2, 3, 4],
  repos: [
    {
      id: 1,
      name: 'porto',
      description: 'Personal portfolio built with Next.js 15, React 19, Tailwind CSS v4, GSAP, Three.js & Supabase.',
      html_url: `https://github.com/${GITHUB_USERNAME}`,
      language: 'TypeScript',
      stargazers_count: 1,
      forks_count: 0,
      updated_at: new Date().toISOString(),
    },
  ],
};

export async function GET() {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'takizawa-portfolio',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
        headers,
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=20`, {
        headers,
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=30`, {
        headers,
        next: { revalidate: 3600 },
      }),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      return NextResponse.json(FALLBACK_DATA);
    }

    const user = await userRes.json();
    const rawRepos = (await reposRes.json()) as GithubRepoSummary[];
    const ownRepos = (Array.isArray(rawRepos) ? rawRepos : []).filter((r) => !r.fork);

    const totalStars = ownRepos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

    // Language breakdown
    const langMap = new Map<string, number>();
    ownRepos.forEach((r) => {
      if (r.language) {
        langMap.set(r.language, (langMap.get(r.language) || 0) + 1);
      }
    });
    const totalLangRepos = Array.from(langMap.values()).reduce((a, b) => a + b, 0) || 1;
    const languages = Array.from(langMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / totalLangRepos) * 100),
      }));

    // Recent 28-day public event intensity bins
    const activityBins = new Array<number>(28).fill(0);
    if (eventsRes.ok) {
      const events = (await eventsRes.json()) as Array<{ created_at?: string }>;
      const now = Date.now();
      (Array.isArray(events) ? events : []).forEach((ev) => {
        if (!ev.created_at) return;
        const diffDays = Math.floor((now - new Date(ev.created_at).getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 28) {
          const idx = 27 - diffDays;
          activityBins[idx] = Math.min(4, activityBins[idx] + 1);
        }
      });
    }

    const topRepos = [...ownRepos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count || b.updated_at.localeCompare(a.updated_at))
      .slice(0, 4)
      .map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        html_url: r.html_url,
        language: r.language,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        updated_at: r.updated_at,
      }));

    return NextResponse.json({
      source: 'live' as const,
      profile: {
        login: user.login || GITHUB_USERNAME,
        name: user.name || 'Jheryco Takizawa',
        avatar_url: user.avatar_url || '',
        html_url: user.html_url || `https://github.com/${GITHUB_USERNAME}`,
        public_repos: user.public_repos ?? ownRepos.length,
        followers: user.followers ?? 0,
        following: user.following ?? 0,
      },
      totalStars,
      languages: languages.length > 0 ? languages : FALLBACK_DATA.languages,
      activityBins,
      repos: topRepos.length > 0 ? topRepos : FALLBACK_DATA.repos,
    });
  } catch {
    return NextResponse.json(FALLBACK_DATA);
  }
}
