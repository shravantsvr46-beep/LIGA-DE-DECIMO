'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Shield } from 'lucide-react';

const PLACEMENTS = {
  's-1': {
    't-3': { rank: 1, label: 'Champion' },
    't-2': { rank: 2, label: 'Runner-up' },
    't-10': { rank: 3, label: 'Third Place' },
    't-9': { rank: 4, label: 'Fourth Place' }
  },
  's-2': {
    't-3': { rank: 1, label: 'Champion' },
    't-10': { rank: 2, label: 'Runner-up' },
    't-9': { rank: 3, label: 'Third Place' },
    't-14': { rank: 4, label: 'Fourth Place' }
  },
  's-3': {
    't-2': { rank: 1, label: 'Champion' },
    't-3': { rank: 2, label: 'Runner-up' },
    't-10': { rank: 3, label: 'Third Place (Shared)' },
    't-14': { rank: 3, label: 'Third Place (Shared)' }
  }
};

const COLS = [
  { key: 'rank', label: 'Rank', title: 'Rank', numeric: true },
  { key: 'name', label: 'Team', title: 'Team', numeric: false },

  { key: 'titles', label: '🏆 Titles', title: 'Champions', numeric: true },
  { key: 'ru', label: '🥈 Runner-up', title: 'Runner-up finishes', numeric: true },
  { key: 'third', label: '🥉 Third', title: 'Third-place finishes', numeric: true },
  { key: 'fourth', label: '4️⃣ Fourth', title: 'Fourth-place finishes', numeric: true },
  { key: 'mp', label: 'MP', title: 'Matches Played', numeric: true },
  { key: 'w', label: 'W', title: 'Wins', numeric: true },
  { key: 'd', label: 'D', title: 'Draws', numeric: true },
  { key: 'l', label: 'L', title: 'Losses', numeric: true },
  { key: 'gf', label: 'GF', title: 'Goals For', numeric: true },
  { key: 'ga', label: 'GA', title: 'Goals Against', numeric: true },
  { key: 'gd', label: 'GD', title: 'Goal Difference', numeric: true },
  { key: 'winPct', label: 'Win %', title: 'Win Percentage', numeric: true },
  { key: 'pts', label: 'Pts', title: 'Points', numeric: true },
  { key: 'ppm', label: 'PPM', title: 'Points Per Match', numeric: true },
];

function PpmPill({ ppm }) {
  let cls;
  if (ppm >= 2.00) cls = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40';
  else if (ppm >= 1.50) cls = 'bg-blue-950/60 text-blue-400 border-blue-800/40';
  else if (ppm >= 1.00) cls = 'bg-orange-950/60 text-orange-400 border-orange-800/40';
  else cls = 'bg-neutral-900/60 text-neutral-500 border-neutral-800/40';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${cls}`}>
      {ppm.toFixed(2)}
    </span>
  );
}

function TierBadge({ tier, bestFinishLabel }) {
  if (bestFinishLabel === 'Champion') {
    return <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">🥇 Champion</span>;
  }
  if (bestFinishLabel === 'Runner-up') {
    return <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold tracking-wider bg-neutral-300/10 text-neutral-300 border border-neutral-300/20">🥈 Runner-up</span>;
  }
  if (bestFinishLabel === 'Third Place') {
    return <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold tracking-wider bg-amber-600/10 text-amber-500 border border-amber-600/20">🥉 Third</span>;
  }
  if (bestFinishLabel === 'Fourth Place') {
    return <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-neutral-900 text-neutral-400 border border-neutral-800">Fourth</span>;
  }
  if (tier === 'QF') {
    return <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-emerald-950/40 text-emerald-450 border border-emerald-900/40 font-semibold">QF Exit</span>;
  }
  return <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-neutral-900 text-neutral-550 border border-neutral-850/60">Group Exit</span>;
}

function GdCell({ gd }) {
  const cls = gd > 0 ? 'text-emerald-400' : gd < 0 ? 'text-red-400' : 'text-neutral-550';
  return <span className={`font-mono ${cls}`}>{gd > 0 ? `+${gd}` : gd}</span>;
}

function TeamBadge({ logo, shortName }) {
  if (logo) return <img src={logo} alt={shortName} className="w-6 h-6 rounded-full object-cover border border-neutral-850 shrink-0" />;
  return (
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-750 flex items-center justify-center font-bold text-neutral-350 text-[9px] shrink-0">
      {shortName?.slice(0, 2) || '??'}
    </div>
  );
}

function rowBgCls(bestFinishLabel, tier) {
  if (bestFinishLabel === 'Champion') {
    return 'border-l-2 border-l-yellow-500/80 bg-yellow-500/[0.02] hover:bg-yellow-500/[0.04] transition-all duration-200';
  }
  if (bestFinishLabel === 'Runner-up') {
    return 'border-l-2 border-l-neutral-300/80 bg-neutral-300/[0.02] hover:bg-neutral-300/[0.04] transition-all duration-200';
  }
  if (bestFinishLabel === 'Third Place') {
    return 'border-l-2 border-l-amber-600/80 bg-amber-600/[0.02] hover:bg-amber-600/[0.04] transition-all duration-200';
  }
  if (bestFinishLabel === 'Fourth Place') {
    return 'border-l bg-neutral-900/10 hover:bg-neutral-900/20 transition-all duration-200';
  }
  if (tier === 'QF') {
    return 'border-l bg-emerald-950/[0.02] hover:bg-emerald-950/[0.05] transition-all duration-200';
  }
  return 'border-l bg-neutral-950/20 hover:bg-neutral-900/10 transition-all duration-200';
}

export default function OverallTournamentRankings({ db }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [sortCol, setSortCol] = useState('rank');
  const [sortDir, setSortDir] = useState('asc');

  const calculatedRows = useMemo(() => {
    if (!db || !db.teams || !db.matches) return [];

    const stats = {};
    db.teams.forEach(t => {
      stats[t.id] = {
        id: t.id,
        name: t.name,
        shortName: t.shortName,
        logo: t.logo,
        seasons: [],
        bestFinishVal: 99,
        bestFinishLabel: 'Group Stage Exit',
        titles: 0,
        ru: 0,
        third: 0,
        fourth: 0,
        mp: 0,
        w: 0,
        d: 0,
        l: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0,
        ppm: 0,
        winPct: 0
      };
    });

    db.teams.forEach(t => {
      const s = stats[t.id];
      const s1 = db.seasons.find(x => x.id === 's-1');
      if (s1) {
        const s1Row = s1.staticStandings?.find(r => r.teamId === t.id);
        if (s1Row && s1Row.played > 0) {
          s.seasons.push('S1');
        }
      }
      ['s-2', 's-3'].forEach((sId, idx) => {
        const hasMatches = db.matches.some(m => m.seasonId === sId && (m.team1Id === t.id || m.team2Id === t.id));
        if (hasMatches) {
          s.seasons.push(`S${idx + 2}`);
        }
      });

      Object.entries(PLACEMENTS).forEach(([sId, placeMap]) => {
        const posInfo = placeMap[t.id];
        if (posInfo) {
          const pos = posInfo.rank;
          if (pos === 1) {
            s.titles += 1;
            if (s.bestFinishVal > 1) { s.bestFinishVal = 1; s.bestFinishLabel = 'Champion'; }
          } else if (pos === 2) {
            s.ru += 1;
            if (s.bestFinishVal > 2) { s.bestFinishVal = 2; s.bestFinishLabel = 'Runner-up'; }
          } else if (pos === 3) {
            s.third += 1;
            if (s.bestFinishVal > 3) { s.bestFinishVal = 3; s.bestFinishLabel = 'Third Place'; }
          } else if (pos === 4) {
            s.fourth += 1;
            if (s.bestFinishVal > 4) { s.bestFinishVal = 4; s.bestFinishLabel = 'Fourth Place'; }
          }
        }
      });
    });

    const qfTeamIds = new Set();
    db.matches.forEach(m => {
      if (m.stage && m.stage.toLowerCase().includes('quarter')) {
        qfTeamIds.add(m.team1Id);
        qfTeamIds.add(m.team2Id);
      }
    });

    qfTeamIds.forEach(id => {
      const s = stats[id];
      if (s && s.bestFinishVal > 5) {
        s.bestFinishVal = 5;
        s.bestFinishLabel = 'Quarter-finalist';
      }
    });

    const completedMatches = db.matches.filter(m => ['s-2', 's-3'].includes(m.seasonId) && m.status === 'completed');

    completedMatches.forEach(m => {
      const t1 = stats[m.team1Id];
      const t2 = stats[m.team2Id];
      if (!t1 || !t2) return;

      t1.mp += 1;
      t2.mp += 1;
      const s1 = Number(m.score1);
      const s2 = Number(m.score2);
      t1.gf += s1;
      t1.ga += s2;
      t2.gf += s2;
      t2.ga += s1;

      if (s1 > s2) {
        t1.w += 1;
        t1.pts += 3;
        t2.l += 1;
      } else if (s2 > s1) {
        t2.w += 1;
        t2.pts += 3;
        t1.l += 1;
      } else {
        t1.d += 1;
        t1.pts += 1;
        t2.d += 1;
        t2.pts += 1;
      }
    });

    Object.values(stats).forEach(s => {
      s.gd = s.gf - s.ga;
      s.ppm = s.mp > 0 ? Number((s.pts / s.mp).toFixed(2)) : 0.00;
      s.winPct = s.mp > 0 ? Number(((s.w / s.mp) * 100).toFixed(1)) : 0.0;
    });

    const getTier = (s) => {
      if (s.titles + s.ru + s.third > 0) return 'PODIUM';
      if (s.bestFinishLabel === 'Quarter-finalist' || s.bestFinishVal === 5) return 'QF';
      return 'GROUP';
    };

    const podiumTeams = Object.values(stats).filter(s => getTier(s) === 'PODIUM');
    const qfTeams = Object.values(stats).filter(s => getTier(s) === 'QF');
    const groupTeams = Object.values(stats).filter(s => getTier(s) === 'GROUP');

    podiumTeams.sort((a, b) => {
      if (b.titles !== a.titles) return b.titles - a.titles;
      if (b.ru !== a.ru) return b.ru - a.ru;
      if (b.third !== a.third) return b.third - a.third;
      if (b.fourth !== a.fourth) return b.fourth - a.fourth;
      const aPodiums = a.titles + a.ru + a.third;
      const bPodiums = b.titles + b.ru + b.third;
      if (bPodiums !== aPodiums) return bPodiums - aPodiums;
      return a.name.localeCompare(b.name);
    });

    const statsSort = (a, b) => {
      if (b.ppm !== a.ppm) return b.ppm - a.ppm;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.name.localeCompare(b.name);
    };
    qfTeams.sort(statsSort);
    groupTeams.sort(statsSort);

    const sortedAll = [...podiumTeams, ...qfTeams, ...groupTeams];
    return sortedAll.map((s, idx) => ({
      ...s,
      rank: idx + 1,
      tier: getTier(s)
    }));
  }, [db]);

  const handleSort = (key) => {
    if (sortCol === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else {
      setSortCol(key);
      setSortDir(key === 'rank' ? 'asc' : 'desc');
    }
  };

  const displayed = useMemo(() => {
    let rows = [...calculatedRows];
    if (filter === 'PODIUM') rows = rows.filter(r => r.tier === 'PODIUM');
    if (filter === 'QF') rows = rows.filter(r => r.tier === 'QF');
    if (filter === 'GROUP') rows = rows.filter(r => r.tier === 'GROUP');

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(r => r.name.toLowerCase().includes(q));
    }

    if (sortCol !== 'rank' || sortDir !== 'asc') {
      rows.sort((a, b) => {
        let av = a[sortCol];
        let bv = b[sortCol];
        if (typeof av === 'string') {
          av = av.toLowerCase();
          bv = bv.toLowerCase();
        }
        if (Array.isArray(av)) {
          av = av.length;
          bv = bv.length;
        }
        const dir = sortDir === 'asc' ? 1 : -1;
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
    }
    return rows;
  }, [calculatedRows, search, filter, sortCol, sortDir]);

  const FILTERS = [
    { id: 'ALL', label: 'All Teams' },
    { id: 'PODIUM', label: 'Podium Teams' },
    { id: 'QF', label: 'Quarter-finalists' },
    { id: 'GROUP', label: 'Group Stage Exits' },
  ];

  if (!db) return null;

  return (
    <section id="rankings" className="relative z-10 max-w-7xl mx-auto px-6 mt-32">
      {/* Section Header */}
      <div className="border-b border-neutral-900 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">Hall of Fame</span>
          <h3 className="text-2xl font-bold tracking-tight text-white mt-1">Overall Tournament Rankings</h3>
          <p className="text-xs text-neutral-500 font-mono mt-1">
            Historical standings combining official achievements with statistical performance
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-550 shrink-0">
          <Shield size={12} className="text-[#D4AF37]" />
          <span>{calculatedRows.length} Teams registered</span>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Search branch..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-900 rounded text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider transition-all duration-200 border ${
                filter === f.id
                  ? 'bg-white text-black border-white font-bold'
                  : 'bg-transparent text-neutral-450 border-neutral-900 hover:border-neutral-700 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rankings Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-900 bg-neutral-950">
        <table className="w-full border-collapse text-xs min-w-[1250px]">
          <thead>
            <tr className="bg-neutral-950 border-b border-neutral-900">
              {COLS.map(col => {
                const active = sortCol === col.key;
                return (
                  <th
                    key={col.key}
                    title={col.title}
                    onClick={() => handleSort(col.key)}
                    className={`px-3 py-3.5 font-mono text-[9px] uppercase tracking-wider cursor-pointer select-none whitespace-nowrap transition-colors ${
                      active ? 'text-white bg-white/5' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.01]'
                    } ${col.key === 'name' ? 'text-left pl-6' : 'text-center'}`}
                  >
                    <span className={`inline-flex items-center gap-1 ${col.key === 'name' ? 'justify-start' : 'justify-center'}`}>
                      <span>{col.label}</span>
                      {active ? (
                        sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />
                      ) : (
                        <ChevronUp size={10} className="opacity-0 hover:opacity-30" />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900/60">
            {displayed.length === 0 ? (
              <tr>
                <td colSpan={COLS.length} className="px-6 py-16 text-center text-neutral-600 font-mono text-xs">
                  No branches found matching filter &amp; search.
                </td>
              </tr>
            ) : (
              displayed.map(row => {
                const bgCls = rowBgCls(row.bestFinishLabel, row.tier);
                return (
                  <tr
                    key={row.id}
                    className={`group transition-all duration-150 hover:-translate-y-[0.5px] hover:shadow-md ${bgCls}`}
                  >
                    {/* Rank */}
                    <td className="px-3 py-3.5 text-center font-mono font-bold text-sm w-12">
                      <span className={
                        row.rank === 1 ? 'text-[#D4AF37]' :
                        row.rank === 2 ? 'text-[#C0C0C0]' :
                        row.rank === 3 ? 'text-[#CD7F32]' :
                        'text-neutral-500'
                      }>
                        {row.rank}
                      </span>
                    </td>

                    {/* Team badge + name */}
                    <td className="px-3 py-3.5 pl-6 min-w-[160px]">
                      <div className="flex items-center gap-2.5">
                        <TeamBadge logo={row.logo} shortName={row.shortName} />
                        <span className="font-semibold text-white tracking-tight text-sm">{row.name}</span>
                      </div>
                    </td>



                    {/* Placements counts */}
                    <td className="px-3 py-3.5 text-center font-mono font-semibold">
                      <span className={row.titles > 0 ? 'text-[#D4AF37]' : 'text-neutral-700'}>
                        {row.titles > 0 ? row.titles : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-center font-mono font-semibold">
                      <span className={row.ru > 0 ? 'text-[#C0C0C0]' : 'text-neutral-700'}>
                        {row.ru > 0 ? row.ru : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-center font-mono font-semibold">
                      <span className={row.third > 0 ? 'text-[#CD7F32]' : 'text-neutral-700'}>
                        {row.third > 0 ? row.third : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-center font-mono text-neutral-400">
                      <span className={row.fourth > 0 ? 'text-neutral-450' : 'text-neutral-700'}>
                        {row.fourth > 0 ? row.fourth : '—'}
                      </span>
                    </td>

                    {/* Stat fields */}
                    <td className="px-3 py-3.5 text-center font-mono text-neutral-300">{row.mp}</td>
                    <td className="px-3 py-3.5 text-center font-mono text-emerald-400 font-semibold">{row.w}</td>
                    <td className="px-3 py-3.5 text-center font-mono text-neutral-450">{row.d}</td>
                    <td className="px-3 py-3.5 text-center font-mono text-red-400/80">{row.l}</td>
                    <td className="px-3 py-3.5 text-center font-mono text-neutral-300">{row.gf}</td>
                    <td className="px-3 py-3.5 text-center font-mono text-neutral-500">{row.ga}</td>
                    <td className="px-3 py-3.5 text-center"><GdCell gd={row.gd} /></td>
                    <td className="px-3 py-3.5 text-center font-mono text-neutral-350">{row.winPct.toFixed(1)}%</td>
                    <td className="px-3 py-3.5 text-center font-mono font-bold text-white">{row.pts}</td>
                    <td className="px-3 py-3.5 text-center"><PpmPill ppm={row.ppm} /></td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <p className="mt-4 text-[10px] text-neutral-500 font-mono text-center leading-relaxed px-4">
        Official tournament achievements include all completed seasons. Statistical records are calculated only from seasons with complete match data.
      </p>
    </section>
  );
}
