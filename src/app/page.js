'use client';

import { useState, useEffect } from 'react';
import { Trophy, ArrowRight, Shield, RefreshCw, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import OverallTournamentRankings from '../components/OverallTournamentRankings';

function Instagram({ size = 24, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const HIGHLIGHTS = [
  {
    url: '/photos/1.jpg',
    title: 'Precision & Focus',
    desc: 'Stark competitive spirits define the historical clashes of the league.'
  },
  {
    url: '/photos/2.jpg',
    title: 'Moments of Glory',
    desc: 'Relive the historic plays that defined the previous champions.'
  },
  {
    url: '/photos/3.jpg',
    title: 'Tactical Supremacy',
    desc: 'Exquisite control and teamwork on display across the branch groups.'
  },
  {
    url: '/photos/4.jpg',
    title: 'Championship Drive',
    desc: 'The ambition to lift the prestigious trophy at the grand finale.'
  },
  {
    url: '/photos/5.jpg',
    title: 'Resilient Defending',
    desc: 'Unwavering defensive units holding strong under high pressure.'
  },
  {
    url: '/photos/6.jpg',
    title: 'A New Campaign',
    desc: 'Season 4 kicks off soon with revised lineups and higher stakes.'
  }
];

export default function HomePage() {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingState, setLoadingState] = useState('init');
  const [error, setError] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getTeamForm = (teamId) => {
    if (!db || !db.matches) return [];
    // Get all completed matches involving this team
    const teamMatches = db.matches.filter(
      m => m.status === 'completed' && (m.team1Id === teamId || m.team2Id === teamId)
    );

    // Sort chronologically (oldest to newest)
    teamMatches.sort((a, b) => {
      const dateA = a.date || '1970-01-01';
      const dateB = b.date || '1970-01-01';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });

    // Take the last 5 matches
    const last5 = teamMatches.slice(-5);

    // Map to W, L, D
    return last5.map(m => {
      const isTeam1 = m.team1Id === teamId;
      const scoreSelf = isTeam1 ? Number(m.score1) : Number(m.score2);
      const scoreOpponent = isTeam1 ? Number(m.score2) : Number(m.score1);
      if (scoreSelf > scoreOpponent) return 'W';
      if (scoreSelf < scoreOpponent) return 'L';
      return 'D';
    });
  };

  const fetchDb = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setLoadingState('connecting');
    } else {
      setIsRefreshing(true);
    }

    try {
      setLoadingState('fetching');
      const res = await fetch('/api/db');
      setLoadingState('response-received');
      if (!res.ok) throw new Error(`Failed to load database (Status ${res.status})`);
      
      setLoadingState('parsing-json');
      const data = await res.json();
      
      setLoadingState('setting-state');
      setDb(data);
      setError(null);
      setLoadingState('complete');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoadingState(`error: ${err.message}`);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDb();
    
    // Auto-refresh every 15 seconds to ensure live updates propagate instantly
    const interval = setInterval(() => {
      fetchDb(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % HIGHLIGHTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [carouselIndex]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin mb-4"></div>
        <span className="font-mono text-xs uppercase tracking-widest text-neutral-450">Loading League Portal...</span>
        <span className="mt-2 font-mono text-[9px] text-neutral-600 uppercase tracking-widest">
          Status: {loadingState}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-black text-center px-4">
        <h2 className="text-xl font-bold tracking-tight text-red-500 font-mono">PORTAL OFFLINE</h2>
        <p className="mt-2 text-neutral-400 max-w-md text-sm">{error}</p>
        <button 
          onClick={() => fetchDb()}
          className="mt-6 px-4 py-2 border border-neutral-800 hover:border-white font-mono text-xs uppercase tracking-widest transition-all rounded bg-neutral-950 text-white"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Get Champions for finished seasons
  const getSeasonChampion = (seasonId) => {
    if (!db || !db.seasons) return null;
    const season = db.seasons.find(s => s.id === seasonId);
    if (!season || !season.championId) return null;
    return db.teams.find(t => t.id === season.championId);
  };

  const getSeasonRunnerUp = (seasonId) => {
    if (!db || !db.seasons) return null;
    const season = db.seasons.find(s => s.id === seasonId);
    if (!season || !season.runnerUpId) return null;
    return db.teams.find(t => t.id === season.runnerUpId);
  };

  return (
    <div className="relative flex-1 bg-black bg-grid-pattern min-h-screen pb-24 selection:bg-neutral-800 selection:text-white">
      
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none z-0"></div>

      {/* Top Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex items-center justify-between border-b border-neutral-900 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img 
            src="/logos/league/logo.png" 
            alt="LIGA DE DÉCIMO Logo" 
            className="w-9 h-9 rounded object-cover border border-neutral-800 bg-neutral-900"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-9 h-9 rounded bg-white flex items-center justify-center font-bold text-black text-lg tracking-tighter hidden">
            L
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest text-[#D4AF37] leading-none">LIGA DE DÉCIMO</h1>
            <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Inter-Branch Football</span>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={() => fetchDb(true)} 
            className="flex items-center gap-1.5 text-xs font-mono tracking-wider text-neutral-400 hover:text-white transition-colors duration-200"
            disabled={isRefreshing}
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'REFRESHING...' : 'LIVE'}
          </button>

          <a 
            href="https://www.instagram.com/liga.de.decimo?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral-800 hover:border-white font-mono text-[11px] uppercase tracking-widest text-neutral-300 hover:text-white bg-neutral-950/60 rounded transition-all duration-300"
          >
            <Instagram size={13} className="text-pink-500" />
            <span className="hidden sm:inline">Instagram</span>
          </a>
          
          <a 
            href="/admin" 
            className="px-4 py-2 border border-neutral-800 hover:border-white font-mono text-[11px] uppercase tracking-widest text-neutral-300 hover:text-white bg-neutral-950/60 rounded transition-all duration-300"
          >
            Admin Panel
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-16 md:pt-24 grid md:grid-cols-12 gap-12 items-center">
        
        {/* Hero Info */}
        <div className="md:col-span-5 flex flex-col justify-center text-left">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2">
            <Layers size={14} /> Official League Portal
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-[#D4AF37] leading-tight text-reveal">
            LIGA DE<br />DÉCIMO
          </h2>
          <p className="mt-6 text-neutral-400 leading-relaxed text-sm md:text-base max-w-sm">
            Where branch pride meets raw footballing passion. Tracking matches, statistics, and history of the ultimate college football tournament.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={() => {
                const s4 = db.seasons.find(s => s.id === 's-4');
                if (s4) setSelectedSeason(s4);
              }}
              className="group px-6 py-3 bg-white text-black font-semibold text-xs uppercase tracking-widest rounded hover:bg-neutral-200 transition-all duration-300 flex items-center gap-2"
            >
              Season 4 Draw
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#seasons"
              className="px-6 py-3 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white font-mono text-xs uppercase tracking-widest rounded bg-neutral-950/40 transition-all duration-300"
            >
              Browse History
            </a>
          </div>
        </div>

        {/* Highlight Carousel */}
        <div className="md:col-span-7 relative w-full h-[320px] md:h-[420px] border border-neutral-900 rounded-lg overflow-hidden bg-neutral-950/30">
          {HIGHLIGHTS.map((item, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 flex flex-col justify-end p-6 md:p-8 transition-opacity duration-1000 ease-in-out ${
                idx === carouselIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center filter grayscale contrast-125 brightness-[0.4]"
                style={{ backgroundImage: `url(${item.url})` }}
              ></div>

              {/* Text overlay */}
              <div className="relative z-20 max-w-md">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest bg-black/60 px-2.5 py-1 border border-neutral-900 rounded">
                  Match Highlight
                </span>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-3">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-neutral-300 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Left Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCarouselIndex((prev) => (prev - 1 + HIGHLIGHTS.length) % HIGHLIGHTS.length);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-black/90 transition-all cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCarouselIndex((prev) => (prev + 1) % HIGHLIGHTS.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-black/90 transition-all cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight size={16} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 right-6 z-20 flex gap-2">
            {HIGHLIGHTS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCarouselIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === carouselIndex ? 'w-4 bg-white' : 'bg-neutral-700 hover:bg-neutral-500'
                }`}
              ></button>
            ))}
          </div>
        </div>

      </header>

      {/* Participating Teams Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 mt-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-900 pb-6 mb-10">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">Contenders</span>
            <h3 className="text-2xl font-bold tracking-tight text-white mt-1">Participating Branches</h3>
          </div>
          <span className="text-xs font-mono text-neutral-500 mt-2 md:mt-0">
            {db.teams.length} teams registered
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {db.teams.map((team) => (
            <div
              key={team.id}
              className="group flex flex-col items-center justify-center p-6 bg-neutral-900/10 hover:bg-neutral-900/30 border border-neutral-900 hover:border-neutral-800 rounded-lg transition-all duration-300"
            >
              {/* Badge */}
              <div className="relative w-16 h-16 rounded-full border border-neutral-800 flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-950 shadow-lg group-hover:scale-105 transition-transform duration-300">
                {team.logo ? (
                  <img 
                    src={team.logo} 
                    alt={team.shortName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-black tracking-wider text-neutral-400 group-hover:text-white transition-colors duration-200">
                    {team.shortName}
                  </span>
                )}
              </div>

              <h4 className="mt-4 text-sm font-semibold tracking-tight text-white text-center">
                {team.name}
              </h4>
            </div>
          ))}
        </div>
      </section>

      {/* Seasons Showcase (Scroll Section) */}
      <section id="seasons" className="relative z-10 max-w-7xl mx-auto px-6 mt-32">
        <div className="border-b border-neutral-900 pb-6 mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">Chronicle</span>
          <h3 className="text-2xl font-bold tracking-tight text-white mt-1">League Seasons Showcase</h3>
        </div>

        {/* Timeline Scroll List */}
        <div className="space-y-8">
          {db.seasons.map((season) => {
            const isUpcoming = season.status === 'upcoming';
            const champ = getSeasonChampion(season.id);
            const runnerUp = getSeasonRunnerUp(season.id);

            return (
              <Link
                key={season.id}
                href={`/season/${season.id}`}
                className={`group relative flex flex-col md:flex-row md:items-center justify-between p-8 bg-neutral-950/40 border ${
                  isUpcoming 
                    ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/5' 
                    : 'border-neutral-900 hover:border-neutral-800'
                } rounded-lg transition-all duration-300 cursor-pointer overflow-hidden`}
              >
                {/* Upcoming Border Highlight */}
                {isUpcoming && (
                  <div className="absolute top-0 left-0 w-1 md:w-auto md:h-full h-1 bg-white animate-pulse"></div>
                )}

                {/* Season Label & Name */}
                <div className="flex flex-col max-w-sm mb-4 md:mb-0">
                  <span className="text-xs font-mono text-neutral-500 tracking-wider">
                    {season.id.toUpperCase()}
                  </span>
                  <h4 className="text-xl font-bold tracking-tight text-white mt-1 group-hover:text-white transition-colors">
                    {season.name}
                  </h4>
                  
                  {isUpcoming && (
                    <div className="mt-3 inline-flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">
                        Group Stage Draw Finished
                      </span>
                    </div>
                  )}
                </div>

                {/* Status / Champ Info */}
                <div className="flex items-center gap-6">
                  {isUpcoming ? (
                    <div className="flex flex-col md:items-end">
                      <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">Upcoming Tournament</span>
                      <span className="text-sm font-semibold text-white mt-1 flex items-center gap-1.5">
                        Fixtures Ready <ArrowRight size={13} className="text-neutral-500 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-8">
                      {/* Champion info */}
                      {champ && (
                        <div className="flex flex-col md:items-end">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 flex items-center gap-1">
                            <Trophy size={10} className="text-white" /> Champion
                          </span>
                          <span className="text-sm font-bold text-white mt-0.5">
                            {champ.name}
                          </span>
                        </div>
                      )}

                      {/* Runner-up */}
                      {runnerUp && (
                        <div className="hidden sm:flex flex-col md:items-end">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Runner-up</span>
                          <span className="text-sm text-neutral-400 mt-0.5">
                            {runnerUp.name}
                          </span>
                        </div>
                      )}

                      {/* View archive */}
                      <span className="text-xs font-mono text-neutral-500 hover:text-white uppercase tracking-widest border border-neutral-900 group-hover:border-neutral-700 px-3 py-1.5 rounded transition-all duration-300">
                        View Archive
                      </span>
                    </div>
                  )}
                </div>

              </Link>
            );
          })}
        </div>
      </section>

      {/* Overall Tournament Rankings Section */}
      <OverallTournamentRankings db={db} />



      {/* Bottom Footer Info */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 mt-36 border-t border-neutral-900 pt-8 flex flex-col md:flex-row items-center justify-between text-neutral-500 text-xs font-mono gap-4">
        <div>
          &copy; {new Date().getFullYear()} <span className="text-[#D4AF37]">LIGA DE DÉCIMO</span>. All branch details reserved.
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-center md:justify-end">
          <a 
            href="https://www.instagram.com/liga.de.decimo?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors duration-200"
          >
            <Instagram size={12} className="text-pink-500" />
            INSTAGRAM
          </a>
          <span>&middot;</span>
          <a href="/admin" className="hover:text-white transition-colors duration-200">ADMIN SECURE ACCESS</a>
          <span>&middot;</span>
          <span>DARK MINIMALIST V1.0</span>
        </div>
      </footer>

    </div>
  );
}
