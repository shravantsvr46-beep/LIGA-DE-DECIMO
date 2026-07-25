'use client';

import { X, Trophy, Shield, Calendar, Activity, TrendingUp } from 'lucide-react';

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

export default function TeamStatsModal({ team, db, onClose }) {
  if (!team || !db) return null;

  // Calculate achievements
  const achievements = [];
  Object.entries(PLACEMENTS).forEach(([seasonId, placeMap]) => {
    const info = placeMap[team.id];
    if (info) {
      const seasonName = seasonId === 's-1' ? 'Season 1' : seasonId === 's-2' ? 'Season 2' : 'Season 3';
      achievements.push({
        season: seasonName,
        rank: info.rank,
        label: info.label
      });
    }
  });

  // Calculate stats and matches
  let goalsScored = 0;
  let goalsConceded = 0;
  const scorersDict = {};
  const teamMatches = [];

  // Filter completed and upcoming matches involving this team
  db.matches.forEach(m => {
    if (m.team1Id !== team.id && m.team2Id !== team.id) return;

    const isTeam1 = m.team1Id === team.id;
    const opponentId = isTeam1 ? m.team2Id : m.team1Id;
    const opponent = db.teams.find(t => t.id === opponentId);

    const matchInfo = {
      id: m.id,
      seasonId: m.seasonId,
      seasonName: m.seasonId === 's-2' ? 'Season 2' : m.seasonId === 's-3' ? 'Season 3' : 'Season 4',
      stage: m.stage || 'Group Stage',
      opponent: opponent || { name: 'Unknown Team', shortName: 'UNK' },
      date: m.date,
      time: m.time,
      status: m.status,
      scoreSelf: isTeam1 ? m.score1 : m.score2,
      scoreOpponent: isTeam1 ? m.score2 : m.score1,
      outcome: 'upcoming'
    };

    if (m.status === 'completed') {
      const selfScore = Number(matchInfo.scoreSelf);
      const oppScore = Number(matchInfo.scoreOpponent);
      goalsScored += selfScore;
      goalsConceded += oppScore;

      if (selfScore > oppScore) {
        matchInfo.outcome = 'W';
      } else if (selfScore < oppScore) {
        matchInfo.outcome = 'L';
      } else {
        matchInfo.outcome = 'D';
      }

      // Aggregate scorers
      const scorerList = m.scorers?.[team.id] || [];
      scorerList.forEach(name => {
        const cleanName = name.trim().toUpperCase();
        if (cleanName) {
          scorersDict[cleanName] = (scorersDict[cleanName] || 0) + 1;
        }
      });
    }

    teamMatches.push(matchInfo);
  });

  // Sort matches by season desc, and completed/upcoming order
  teamMatches.sort((a, b) => {
    if (a.seasonId !== b.seasonId) {
      return b.seasonId.localeCompare(a.seasonId);
    }
    // group completed matches before upcoming
    if (a.status !== b.status) {
      return a.status === 'completed' ? -1 : 1;
    }
    return (b.date || '').localeCompare(a.date || '');
  });

  // Format scorers list
  const sortedScorers = Object.entries(scorersDict)
    .map(([name, goals]) => ({ name, goals }))
    .sort((a, b) => b.goals - a.goals);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-900 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] animate-in fade-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white p-1.5 rounded-full hover:bg-neutral-900 transition-colors z-10"
        >
          <X size={18} />
        </button>

        {/* Left column: Overview & Achievements */}
        <div className="w-full md:w-2/5 border-b md:border-b-0 md:border-r border-neutral-900 p-6 md:p-8 flex flex-col bg-neutral-950/40">
          <div className="flex items-center gap-4 mb-6">
            {team.logo ? (
              <img src={team.logo} alt={team.name} className="w-16 h-16 rounded-full border border-neutral-800 object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center font-bold text-neutral-300 text-lg">
                {team.shortName}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">{team.name}</h2>
              <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase">{team.shortName} FC</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="p-3.5 bg-neutral-900/20 border border-neutral-900/60 rounded-lg flex flex-col">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Activity size={10} className="text-emerald-500" /> Goals Scored
              </span>
              <span className="text-2xl font-bold text-white font-mono">{goalsScored}</span>
            </div>
            <div className="p-3.5 bg-neutral-900/20 border border-neutral-900/60 rounded-lg flex flex-col">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <TrendingUp size={10} className="text-red-400" /> Goals Conceded
              </span>
              <span className="text-2xl font-bold text-white font-mono">{goalsConceded}</span>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-450 mb-4 flex items-center gap-1.5 border-b border-neutral-900 pb-2">
              <Trophy size={12} className="text-[#D4AF37]" /> Season Achievements
            </h3>
            {achievements.length === 0 ? (
              <p className="text-xs text-neutral-600 font-mono italic">No podium finishes recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {achievements.map((ach, index) => {
                  let accentCls = '';
                  let badge = '';
                  if (ach.rank === 1) { accentCls = 'text-yellow-400'; badge = '🥇'; }
                  else if (ach.rank === 2) { accentCls = 'text-neutral-300'; badge = '🥈'; }
                  else { accentCls = 'text-amber-600'; badge = '🥉'; }
                  return (
                    <div key={index} className="flex items-center justify-between p-2.5 bg-neutral-900/10 border border-neutral-900/60 rounded-lg">
                      <span className="text-xs text-neutral-400 font-mono font-medium">{ach.season}</span>
                      <span className={`text-xs font-mono font-bold flex items-center gap-1 ${accentCls}`}>
                        <span>{badge}</span> {ach.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Matches & Scorers scrollable content */}
        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col overflow-y-auto gap-8 max-h-[50vh] md:max-h-full">
          
          {/* Match History */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-450 mb-4 flex items-center gap-1.5 border-b border-neutral-900 pb-2">
              <Calendar size={12} className="text-neutral-500" /> Match History (All Seasons)
            </h3>
            {teamMatches.length === 0 ? (
              <p className="text-xs text-neutral-650 font-mono">No matches recorded in the database.</p>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {teamMatches.map(m => {
                  const outcomeStyles = 
                    m.outcome === 'W' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40' :
                    m.outcome === 'L' ? 'bg-red-950/60 text-red-400 border-red-900/30' :
                    m.outcome === 'D' ? 'bg-orange-950/60 text-orange-400 border-orange-900/30' :
                    'bg-neutral-900 text-neutral-500 border-neutral-850';
                  
                  return (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-900/60 rounded hover:border-neutral-800 transition-colors">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wide">
                          {m.seasonName} &middot; {m.stage}
                        </span>
                        <div className="flex items-center gap-2">
                          {m.opponent.logo ? (
                            <img src={m.opponent.logo} alt={m.opponent.shortName} className="w-4 h-4 rounded-full object-cover" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center text-[7px] font-bold text-neutral-400">
                              {m.opponent.shortName?.slice(0, 2)}
                            </div>
                          )}
                          <span className="text-xs font-semibold text-white">vs {m.opponent.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-white">
                          {m.status === 'completed' ? `${m.scoreSelf} - ${m.scoreOpponent}` : 'vs'}
                        </span>
                        <span className={`w-8 py-0.5 text-center rounded border text-[9px] font-mono font-bold ${outcomeStyles}`}>
                          {m.outcome === 'upcoming' ? 'UPC' : m.outcome}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Scorers */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-450 mb-4 flex items-center gap-1.5 border-b border-neutral-900 pb-2">
              <Shield size={12} className="text-neutral-550" /> Goal Scorers List
            </h3>
            {sortedScorers.length === 0 ? (
              <p className="text-xs text-neutral-600 font-mono italic">No goalscorers recorded for this branch.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {sortedScorers.map((scorer, i) => (
                  <div key={scorer.name} className="flex items-center justify-between p-2.5 bg-neutral-900/10 border border-neutral-900/60 rounded">
                    <span className="text-xs text-neutral-300 font-mono flex items-center gap-2">
                      <span className="text-neutral-500 font-bold">#{i + 1}</span> {scorer.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#D4AF37] bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/10">
                      {scorer.goals} {scorer.goals === 1 ? 'Goal' : 'Goals'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}