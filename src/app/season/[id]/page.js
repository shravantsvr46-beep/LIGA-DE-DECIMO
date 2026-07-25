'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Trophy, BarChart2 } from 'lucide-react';

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

const PLACEMENTS = {
  's-1': [
    { pos: '1st', teamId: 't-3',  label: 'Champion',             color: 'bg-white text-black font-bold border-white' },
    { pos: '2nd', teamId: 't-2',  label: 'Runner-up',            color: 'bg-neutral-800 text-neutral-200 border-neutral-700' },
    { pos: '3rd', teamId: 't-10', label: 'Third Place',          color: 'bg-neutral-900 text-neutral-400 border-neutral-800' },
    { pos: '4th', teamId: 't-9',  label: 'Fourth Place',         color: 'bg-neutral-950 text-neutral-500 border-neutral-900' },
  ],
  's-2': [
    { pos: '1st', teamId: 't-3',  label: 'Champion',             color: 'bg-white text-black font-bold border-white' },
    { pos: '2nd', teamId: 't-10', label: 'Runner-up',            color: 'bg-neutral-800 text-neutral-200 border-neutral-700' },
    { pos: '3rd', teamId: 't-9',  label: 'Third Place',          color: 'bg-neutral-900 text-neutral-400 border-neutral-800' },
    { pos: '4th', teamId: 't-14', label: 'Fourth Place',         color: 'bg-neutral-950 text-neutral-500 border-neutral-900' },
  ],
  's-3': [
    { pos: '1st', teamId: 't-2',  label: 'Champion',             color: 'bg-white text-black font-bold border-white' },
    { pos: '2nd', teamId: 't-3',  label: 'Runner-up',            color: 'bg-neutral-800 text-neutral-200 border-neutral-700' },
    { pos: '3rd', teamId: 't-10', label: 'Third Place (Shared)', color: 'bg-neutral-900 text-neutral-400 border-neutral-800' },
    { pos: '3rd', teamId: 't-14', label: 'Third Place (Shared)', color: 'bg-neutral-900 text-neutral-400 border-neutral-800' },
  ],
};

const S2_RANKINGS = [
  { rank:1,  teamId:'t-3',  mp:5, w:4, d:1, l:0, gf:8,  ga:0,  gd:8,  pts:13, ppm:2.600 },
  { rank:2,  teamId:'t-10', mp:6, w:3, d:2, l:1, gf:11, ga:7,  gd:4,  pts:11, ppm:1.833 },
  { rank:3,  teamId:'t-9',  mp:5, w:3, d:1, l:1, gf:5,  ga:3,  gd:2,  pts:10, ppm:2.000 },
  { rank:4,  teamId:'t-14', mp:6, w:3, d:2, l:1, gf:6,  ga:4,  gd:2,  pts:11, ppm:1.833 },
  { rank:5,  teamId:'t-1',  mp:3, w:1, d:1, l:1, gf:3,  ga:2,  gd:1,  pts:4,  ppm:1.333 },
  { rank:6,  teamId:'t-12', mp:4, w:1, d:2, l:1, gf:4,  ga:2,  gd:2,  pts:5,  ppm:1.250 },
  { rank:7,  teamId:'t-11', mp:3, w:1, d:0, l:2, gf:4,  ga:4,  gd:0,  pts:3,  ppm:1.000 },
  { rank:8,  teamId:'t-5',  mp:4, w:1, d:1, l:2, gf:1,  ga:3,  gd:-2, pts:4,  ppm:1.000 },
  { rank:9,  teamId:'t-13', mp:3, w:1, d:1, l:1, gf:3,  ga:2,  gd:1,  pts:4,  ppm:1.333 },
  { rank:10, teamId:'t-4',  mp:3, w:1, d:1, l:1, gf:3,  ga:3,  gd:0,  pts:4,  ppm:1.333 },
  { rank:11, teamId:'t-2',  mp:3, w:1, d:0, l:2, gf:2,  ga:5,  gd:-3, pts:3,  ppm:1.000 },
  { rank:12, teamId:'t-6',  mp:2, w:0, d:0, l:2, gf:1,  ga:5,  gd:-4, pts:0,  ppm:0.000 },
  { rank:13, teamId:'t-7',  mp:2, w:0, d:0, l:2, gf:0,  ga:5,  gd:-5, pts:0,  ppm:0.000 },
  { rank:14, teamId:'t-8',  mp:3, w:0, d:0, l:3, gf:2,  ga:8,  gd:-6, pts:0,  ppm:0.000 },
];

const S3_RANKINGS = [
  { rank:1,  teamId:'t-2',  mp:5, w:2, d:2, l:1, gf:7,  ga:5,  gd:2,  pts:8,  ppm:1.600 },
  { rank:2,  teamId:'t-3',  mp:5, w:3, d:1, l:1, gf:8,  ga:5,  gd:3,  pts:10, ppm:2.000 },
  { rank:3,  teamId:'t-10', mp:4, w:3, d:1, l:0, gf:6,  ga:0,  gd:6,  pts:10, ppm:2.500 },
  { rank:3,  teamId:'t-14', mp:5, w:2, d:1, l:2, gf:10, ga:8,  gd:2,  pts:7,  ppm:1.400 },
  { rank:5,  teamId:'t-1',  mp:3, w:2, d:1, l:0, gf:6,  ga:1,  gd:5,  pts:7,  ppm:2.333 },
  { rank:6,  teamId:'t-6',  mp:4, w:2, d:0, l:2, gf:7,  ga:6,  gd:1,  pts:6,  ppm:1.500 },
  { rank:7,  teamId:'t-9',  mp:3, w:1, d:1, l:1, gf:2,  ga:2,  gd:0,  pts:4,  ppm:1.333 },
  { rank:8,  teamId:'t-13', mp:3, w:1, d:1, l:1, gf:1,  ga:1,  gd:0,  pts:4,  ppm:1.333 },
  { rank:9,  teamId:'t-5',  mp:3, w:2, d:0, l:1, gf:7,  ga:4,  gd:3,  pts:6,  ppm:2.000 },
  { rank:10, teamId:'t-7',  mp:2, w:0, d:0, l:2, gf:5,  ga:9,  gd:-4, pts:0,  ppm:0.000 },
  { rank:11, teamId:'t-11', mp:2, w:0, d:0, l:2, gf:0,  ga:4,  gd:-4, pts:0,  ppm:0.000 },
  { rank:12, teamId:'t-12', mp:2, w:0, d:0, l:2, gf:0,  ga:5,  gd:-5, pts:0,  ppm:0.000 },
  { rank:13, teamId:'t-8',  mp:3, w:0, d:0, l:3, gf:1,  ga:10, gd:-9, pts:0,  ppm:0.000 },
];

function TeamBadge({ team, size = 'sm' }) {
  const cls = size === 'md' ? 'w-10 h-10 text-sm' : 'w-7 h-7 text-xs';
  if (!team) return null;
  if (team.logo) return (
    <img src={team.logo} alt={team.shortName}
      className={`${cls} rounded-full object-cover border border-neutral-800 shrink-0`} />
  );
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center font-bold text-neutral-200 tracking-wider shrink-0`}>
      {team.shortName.slice(0, 2)}
    </div>
  );
}

function GdCell({ gd }) {
  const cls = gd > 0 ? 'text-white' : gd < 0 ? 'text-neutral-500' : 'text-neutral-400';
  return <span className={cls}>{gd > 0 ? `+${gd}` : gd}</span>;
}

function RankingsTable({ rows, teamsMap }) {
  return (
    <div className="overflow-x-auto border border-neutral-900 rounded-lg bg-neutral-950">
      <table className="w-full border-collapse text-left text-sm text-neutral-200">
        <thead>
          <tr className="border-b border-neutral-900 bg-neutral-950/80 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            {['Pos','Team','MP','W','D','L','GF','GA','GD','Pts','PPM'].map(h => (
              <th key={h} scope="col" className="px-4 py-3 font-normal text-center first:pl-6 last:pr-6">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-900/50">
          {rows.map((row, i) => {
            const team = teamsMap[row.teamId];
            return (
              <tr key={`${row.teamId}-${i}`} className="hover:bg-neutral-900/20 transition-colors">
                <td className="px-6 py-3.5 text-center text-neutral-500 font-mono font-medium">{row.rank}</td>
                <td className="px-4 py-3.5 font-medium text-white">
                  <div className="flex items-center gap-2">
                    <TeamBadge team={team} />
                    <span>{team ? team.name : row.teamId}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-center font-mono">{row.mp}</td>
                <td className="px-4 py-3.5 text-center font-mono">{row.w}</td>
                <td className="px-4 py-3.5 text-center font-mono">{row.d}</td>
                <td className="px-4 py-3.5 text-center font-mono">{row.l}</td>
                <td className="px-4 py-3.5 text-center font-mono text-neutral-300">{row.gf}</td>
                <td className="px-4 py-3.5 text-center font-mono text-neutral-500">{row.ga}</td>
                <td className="px-4 py-3.5 text-center font-mono"><GdCell gd={row.gd} /></td>
                <td className="px-4 py-3.5 text-center font-mono font-bold text-neutral-200">{row.pts}</td>
                <td className="px-6 py-3.5 text-center font-mono font-extrabold text-[#D4AF37]">{row.ppm.toFixed(3)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function SeasonPage() {
  const params   = useParams();
  const router   = useRouter();
  const seasonId = params.id;

  const [db,        setDb]        = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('fixtures');

  useEffect(() => {
    fetch('/api/db')
      .then(r => r.json())
      .then(data => { setDb(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <span className="text-neutral-500 font-mono text-sm tracking-widest animate-pulse">LOADING ARCHIVE...</span>
    </div>
  );
  if (!db) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <span className="text-neutral-500 font-mono text-sm">Failed to load data.</span>
    </div>
  );

  const season = db.seasons.find(s => s.id === seasonId);
  if (!season) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <span className="text-neutral-500 font-mono text-sm">Season not found.</span>
    </div>
  );

  const teamsMap   = db.teams.reduce((acc, t) => { acc[t.id] = t; return acc; }, {});
  const standings  = db.standings?.[season.id] || {};
  const placements = PLACEMENTS[season.id];
  const isUpcoming = season.status === 'upcoming';
  const showTabs   = season.id !== 's-1' && !isUpcoming;

  const sortedMatches = db.matches
    .filter(m => m.seasonId === season.id)
    .sort((a, b) => {
      const dd = new Date(a.date) - new Date(b.date);
      return dd !== 0 ? dd : a.time.localeCompare(b.time);
    });

  const rankingsData  = season.id === 's-2' ? S2_RANKINGS : season.id === 's-3' ? S3_RANKINGS : null;
  const rankingsLabel = season.id === 's-2' ? 'Season 2 Tournament Rankings' : 'Season 3 Tournament Rankings';
  const rankingsNote  = season.id === 's-3'
    ? 'Official positions take precedence (MECH BETA & EC GAMMA shared 3rd — no 3rd-place play-off).'
    : 'Official tournament knockout positions take precedence.';

  const formatScorers = (list) => {
    if (!list?.length) return '';
    const filtered = list.filter(n => n.toUpperCase() !== 'OG');
    if (!filtered.length) return '';
    const counts = {};
    filtered.forEach(n => { counts[n] = (counts[n] || 0) + 1; });
    return Object.entries(counts).map(([n, q]) => `${n}${q > 1 ? "'".repeat(q) : "'"}`).join(', ');
  };

  const MatchCard = ({ match }) => {
    const t1 = teamsMap[match.team1Id];
    const t2 = teamsMap[match.team2Id];
    const isCompleted = match.status === 'completed';
    const isLive      = match.status === 'live';
    const s1 = Number(match.score1);
    const s2 = Number(match.score2);
    const t1Won  = isCompleted && s1 > s2;
    const t2Won  = isCompleted && s2 > s1;
    const isDraw = isCompleted && s1 === s2;

    return (
      <div className="flex flex-col md:flex-row items-center justify-between p-5 bg-neutral-900/30 hover:bg-neutral-900/50 border border-neutral-900 hover:border-neutral-800 rounded-lg transition-all duration-300 gap-4">
        <div className="shrink-0 order-2 md:order-1">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest bg-neutral-900/60 px-2.5 py-1 rounded border border-neutral-900/80">{match.stage}</span>
        </div>
        <div className="flex items-center justify-center gap-4 md:gap-8 order-1 md:order-2 flex-1 max-w-lg">
          <div className="flex flex-col items-end w-1/3">
            <div className="flex items-center gap-3 justify-end w-full">
              <span className={`text-sm md:text-base font-semibold tracking-tight text-right ${isCompleted && !t1Won && !isDraw ? 'text-neutral-500 font-normal' : 'text-white'}`}>{t1?.name || 'Deleted Team'}</span>
              <TeamBadge team={t1} />
            </div>
            {match.scorers?.[match.team1Id]?.length > 0 && (
              <span className="text-[10px] text-neutral-500 font-mono mt-1.5 pr-10 text-right leading-none">{formatScorers(match.scorers[match.team1Id])}</span>
            )}
          </div>
          <div className="flex flex-col items-center justify-center min-w-[70px]">
            {isCompleted ? (
              <div className="flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded text-sm font-mono font-bold tracking-widest text-white shadow-inner">
                <span className={t1Won ? 'text-white' : 'text-neutral-400'}>{s1}</span>
                <span className="text-neutral-600">:</span>
                <span className={t2Won ? 'text-white' : 'text-neutral-400'}>{s2}</span>
              </div>
            ) : isLive ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 bg-white/5 border border-red-800/40 px-3 py-1.5 rounded font-mono font-bold text-red-500 animate-pulse">
                  <span>{s1}</span><span className="text-neutral-500">:</span><span>{s2}</span>
                </div>
                <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest font-bold mt-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />LIVE
                </span>
              </div>
            ) : (
              <div className="text-xs font-mono text-neutral-400 bg-neutral-900 border border-neutral-900 px-3 py-1.5 rounded uppercase tracking-wider">VS</div>
            )}
          </div>
          <div className="flex flex-col items-start w-1/3">
            <div className="flex items-center gap-3 justify-start w-full">
              <TeamBadge team={t2} />
              <span className={`text-sm md:text-base font-semibold tracking-tight text-left ${isCompleted && !t2Won && !isDraw ? 'text-neutral-500 font-normal' : 'text-white'}`}>{t2?.name || 'Deleted Team'}</span>
            </div>
            {match.scorers?.[match.team2Id]?.length > 0 && (
              <span className="text-[10px] text-neutral-500 font-mono mt-1.5 pl-10 text-left leading-none">{formatScorers(match.scorers[match.team2Id])}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end order-3">
          {isCompleted ? (
            <span className="text-xs font-mono text-neutral-500 border border-neutral-900 px-2 py-0.5 rounded">{t1Won ? `${t1?.shortName} Win` : t2Won ? `${t2?.shortName} Win` : 'Drawn'}</span>
          ) : isLive ? (
            <span className="text-xs font-mono text-red-500 border border-red-950/30 bg-red-950/10 px-2.5 py-0.5 rounded tracking-wider uppercase font-bold">In Progress</span>
          ) : (
            <span className="text-xs font-mono text-neutral-500 border border-neutral-900 px-2 py-0.5 rounded tracking-wider uppercase">Upcoming</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100">

      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 gap-4">
          <button
            onClick={() => router.push('/#seasons')}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white transition-colors duration-200 group shrink-0"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden sm:block text-xs font-mono uppercase tracking-widest text-neutral-600">Archive</span>
            <h1 className="text-sm font-bold text-white tracking-tight truncate">{season.name}</h1>
            <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-mono border ${
              isUpcoming ? 'bg-white/5 border-white/20 text-white' : 'bg-neutral-900/50 border-neutral-800 text-neutral-500'
            }`}>{season.status}</span>
          </div>
          <div className="w-16 shrink-0" />
        </div>

        {showTabs && (
          <div className="border-t border-neutral-900 bg-neutral-950/60">
            <div className="max-w-5xl mx-auto flex">
              {[
                { id: 'fixtures', icon: <Calendar size={13} />, label: 'Fixtures & Results' },
                { id: 'table',    icon: <Trophy   size={13} />, label: 'Points Table'       },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono tracking-wider transition-colors duration-200 border-b-2 ${
                    activeTab === tab.id ? 'border-white text-white font-medium' : 'border-transparent text-neutral-500 hover:text-neutral-200'
                  }`}>
                  {tab.icon} {tab.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* Placements */}
        {placements && (
          <section className={`flex flex-col items-center py-6 space-y-6 ${showTabs ? 'border-b border-neutral-900' : ''}`}>
            <div className="text-center space-y-1">
              <Trophy className="w-10 h-10 text-white mx-auto mb-1" />
              <h2 className="text-lg font-bold tracking-tight text-white uppercase font-mono">Tournament Placements</h2>
              <p className="text-[10px] text-neutral-500 font-mono">Official placements archive</p>
            </div>
            <div className="w-full max-w-md space-y-3">
              {placements.map((place, i) => {
                const team = teamsMap[place.teamId];
                return (
                  <div key={`${place.teamId}-${i}`} className="flex items-center justify-between p-3.5 bg-neutral-900/20 border border-neutral-900 rounded hover:border-neutral-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full border flex items-center justify-center font-mono text-[10px] ${place.color}`}>{place.pos}</span>
                      <div className="flex items-center gap-2.5">
                        <TeamBadge team={team} />
                        <span className="font-semibold text-white text-xs tracking-tight">{team?.name || 'Unknown'}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded">{place.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Season 1 / upcoming: just show all matches */}
        {(season.id === 's-1' || isUpcoming) && (
          <section className="space-y-4">
            {sortedMatches.length === 0
              ? <div className="text-center py-16 text-neutral-500 font-mono text-sm">No fixtures generated yet.</div>
              : sortedMatches.map(m => <MatchCard key={m.id} match={m} />)
            }
          </section>
        )}

        {/* Fixtures tab */}
        {showTabs && activeTab === 'fixtures' && (
          <section className="space-y-6">
            {(season.championId || season.topScorer) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {season.championId && (() => {
                  const champTeam = teamsMap[season.championId];
                  return (
                    <div className="bg-neutral-900/10 border border-neutral-900 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-white/5 border border-neutral-800 flex items-center justify-center text-amber-500">
                          <Trophy size={18} className="stroke-[1.5]" />
                        </div>
                        <div>
                          <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 block">Season Champion</span>
                          <h4 className="text-sm font-bold text-white mt-0.5">{champTeam?.name || 'Unknown'}</h4>
                        </div>
                      </div>
                      {champTeam?.logo && <img src={champTeam.logo} alt={champTeam.shortName} className="w-8 h-8 rounded-full object-cover border border-neutral-800" />}
                    </div>
                  );
                })()}
                {season.topScorer && (
                  <div className="bg-neutral-900/10 border border-neutral-900 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-white/5 border border-neutral-800 flex items-center justify-center text-amber-500">
                        <Trophy size={18} className="stroke-[1.5]" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 block">Season Top Scorer</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{season.topScorer.name}</h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 block">{season.topScorer.teamName}</span>
                      <p className="text-sm font-bold text-white mt-0.5">{season.topScorer.goals} Goals</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {sortedMatches.length === 0
              ? <div className="text-center py-16 text-neutral-500 font-mono text-sm">No fixtures generated yet.</div>
              : <div className="space-y-4">{sortedMatches.map(m => <MatchCard key={m.id} match={m} />)}</div>
            }
          </section>
        )}

        {/* Points table tab */}
        {showTabs && activeTab === 'table' && (
          <section className="space-y-10">
            {standings && Object.keys(standings).length > 0 && (
              <div className="bg-neutral-900/10 border border-neutral-900 p-5 rounded-lg space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5 font-bold">
                  <Trophy size={12} className="text-[#D4AF37]" /> Group Toppers (Leaders)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(standings).sort().map(([groupName, rows]) => {
                    const topper = rows[0];
                    const team   = topper ? teamsMap[topper.teamId] : null;
                    return (
                      <div key={groupName} className="flex items-center gap-2.5 bg-neutral-950 p-2.5 rounded border border-neutral-900">
                        <TeamBadge team={team} size="sm" />
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-mono text-neutral-500 uppercase block">{groupName}</span>
                          <span className="text-xs font-bold text-white block truncate">{team?.name || 'TBD'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {standings && Object.keys(standings).sort().map(groupName => {
              const groupRows = standings[groupName] || [];
              return (
                <div key={groupName} className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-450 font-bold border-b border-neutral-900 pb-2 flex items-center justify-between">
                    <span>{groupName} Standings</span>
                    <span className="text-[10px] font-normal text-neutral-500">{groupRows.length} Teams</span>
                  </h3>
                  <div className="overflow-x-auto border border-neutral-900 rounded-lg bg-neutral-950">
                    <table className="w-full border-collapse text-left text-sm text-neutral-200">
                      <thead>
                        <tr className="border-b border-neutral-900 bg-neutral-950/80 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                          {['Pos','Team','P','W','D','L','GD','Pts'].map(h => (
                            <th key={h} scope="col" className="px-4 py-3 font-normal text-center first:pl-6 last:pr-6">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900/50">
                        {groupRows.length === 0
                          ? <tr><td colSpan={8} className="px-6 py-8 text-center text-neutral-500 font-mono text-xs">No standings recorded.</td></tr>
                          : groupRows.map((row, idx) => {
                            const team = teamsMap[row.teamId];
                            return (
                              <tr key={row.teamId} className="hover:bg-neutral-900/20 transition-colors">
                                <td className="px-6 py-3 text-center font-mono font-medium text-neutral-400">
                                  {idx === 0
                                    ? <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white text-black font-bold text-xs">1</span>
                                    : idx + 1}
                                </td>
                                <td className="px-4 py-3 font-medium text-white">
                                  <div className="flex items-center gap-3">
                                    <TeamBadge team={team} />
                                    <span className="truncate max-w-[140px] sm:max-w-none">{row.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center font-mono text-neutral-300">{row.played}</td>
                                <td className="px-4 py-3 text-center font-mono text-neutral-300">{row.won}</td>
                                <td className="px-4 py-3 text-center font-mono text-neutral-300">{row.drawn}</td>
                                <td className="px-4 py-3 text-center font-mono text-neutral-300">{row.lost}</td>
                                <td className="px-4 py-3 text-center font-mono"><GdCell gd={row.goalDifference} /></td>
                                <td className="px-6 py-3 text-center font-mono font-bold text-white text-base">{row.points}</td>
                              </tr>
                            );
                          })
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            {rankingsData && (
              <div className="space-y-4 pt-6 border-t border-neutral-900">
                <h3 className="text-sm font-mono uppercase tracking-widest text-[#D4AF37] font-bold flex items-center gap-1.5">
                  <BarChart2 size={14} className="text-[#D4AF37]" /> {rankingsLabel}
                </h3>
                <div className="p-4 bg-neutral-900/10 border border-neutral-900 rounded text-[11px] font-mono text-neutral-400 leading-relaxed space-y-1.5">
                  <span className="font-bold text-white uppercase block">Ranking Rules & Logic:</span>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>{season.id === 's-3' ? '1st-3rd' : '1st-4th'}:</strong> {rankingsNote}</li>
                    <li><strong>5th-8th (QF exits) & 9th-{season.id === 's-3' ? '13th' : '14th'} (Group exits):</strong> PPM &gt; GD &gt; GF &gt; Alphabetical.</li>
                    <li>PPM = Points divided by Matches Played (group stage only).</li>
                  </ul>
                </div>
                <RankingsTable rows={rankingsData} teamsMap={teamsMap} />
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-4 sm:px-6 mt-20 border-t border-neutral-900 pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between text-neutral-500 text-xs font-mono gap-4">
        <div>© {new Date().getFullYear()} <span className="text-[#D4AF37]">LIGA DE DECIMO</span>. All branch details reserved.</div>
        <div className="flex items-center gap-4 flex-wrap">
          <a 
            href="https://www.instagram.com/liga.de.decimo?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-white transition-colors duration-200"
          >
            <Instagram size={12} className="text-pink-500" />
            INSTAGRAM
          </a>
          <span>&middot;</span>
          <button onClick={() => router.push('/')} className="hover:text-white transition-colors duration-200">Back to Home</button>
        </div>
      </footer>
    </div>
  );
}
