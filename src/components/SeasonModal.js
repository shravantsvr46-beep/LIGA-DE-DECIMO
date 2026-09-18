'use client';

import { useState } from 'react';
import { X, Calendar, Trophy, BarChart2 } from 'lucide-react';

export default function SeasonModal({ season, onClose, db }) {
  const [activeTab, setActiveTab] = useState(season?.id === 's-4' || season?.status === 'underway' || season?.status === 'upcoming' ? 'table' : 'fixtures'); // 'fixtures' | 'table' | 'allTime'

  const placementsConfig = {
    's-1': [
      { pos: '1st', teamId: 't-3', label: 'Champion', color: 'bg-white text-black font-bold border-white' },
      { pos: '2nd', teamId: 't-2', label: 'Runner-up', color: 'bg-neutral-800 text-neutral-200 border-neutral-700' },
      { pos: '3rd', teamId: 't-10', label: 'Third Place', color: 'bg-neutral-900 text-neutral-400 border-neutral-800' },
      { pos: '4th', teamId: 't-9', label: 'Fourth Place', color: 'bg-neutral-950 text-neutral-500 border-neutral-900' }
    ],
    's-2': [
      { pos: '1st', teamId: 't-3', label: 'Champion', color: 'bg-white text-black font-bold border-white' },
      { pos: '2nd', teamId: 't-10', label: 'Runner-up', color: 'bg-neutral-800 text-neutral-200 border-neutral-700' },
      { pos: '3rd', teamId: 't-9', label: 'Third Place', color: 'bg-neutral-900 text-neutral-400 border-neutral-800' },
      { pos: '4th', teamId: 't-14', label: 'Fourth Place', color: 'bg-neutral-950 text-neutral-500 border-neutral-900' }
    ],
    's-3': [
      { pos: '1st', teamId: 't-2', label: 'Champion', color: 'bg-white text-black font-bold border-white' },
      { pos: '2nd', teamId: 't-3', label: 'Runner-up', color: 'bg-neutral-800 text-neutral-200 border-neutral-700' },
      { pos: '3rd', teamId: 't-10', label: 'Third Place (Shared)', color: 'bg-neutral-900 text-neutral-400 border-neutral-800' },
      { pos: '3rd', teamId: 't-14', label: 'Third Place (Shared)', color: 'bg-neutral-900 text-neutral-400 border-neutral-800' }
    ]
  };

  const formatScorers = (scorerList) => {
    if (!scorerList || scorerList.length === 0) return '';
    const counts = {};
    scorerList.forEach(name => {
      const clean = (name || '').trim().toUpperCase();
      if (!clean) return;
      counts[clean] = (counts[clean] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, qty]) => `${name}${qty > 1 ? "'".repeat(qty) : "'"}`)
      .join(', ');
  };

  if (!season) return null;

  const teamsMap = db.teams.reduce((acc, team) => {
    acc[team.id] = team;
    return acc;
  }, {});

  // Filter matches for this season
  const seasonMatches = db.matches.filter(m => m.seasonId === season.id);
  
  // Sort matches by date and time
  const sortedMatches = [...seasonMatches].sort((a, b) => {
    const dateDiff = new Date(a.date) - new Date(b.date);
    if (dateDiff !== 0) return dateDiff;
    return a.time.localeCompare(b.time);
  });

  const standings = db?.standings?.[season.id] || {};
  const allTimeRankings = db.allTimeRankings || [];

  // Helper to render team badge
  const renderTeamBadge = (team, size = 'sm') => {
    if (!team) return null;
    const sizeClasses = size === 'md' ? 'w-10 h-10 text-sm' : 'w-7 h-7 text-xs';
    
    if (team.logo) {
      return (
        <img 
          src={team.logo} 
          alt={team.shortName} 
          className={`${sizeClasses} rounded-full object-cover border border-neutral-800`}
        />
      );
    }

    // Default minimalist badge using short name
    return (
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center font-bold text-neutral-200 tracking-wider`}>
        {team.shortName.slice(0, 2)}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md transition-opacity duration-300">
      <div className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[85vh] flex flex-col bg-neutral-950 border border-neutral-800 rounded-t-2xl sm:rounded-lg shadow-2xl overflow-hidden animate-slide-up sm:animate-text-reveal-anim">
        
        {/* Mobile Pull Indicator */}
        <div className="w-12 h-1 bg-neutral-700 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-900 bg-neutral-950">
          <div>
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">Tournament Archive</span>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
              {season.name} 
              <span className={`ml-3 text-xs px-2.5 py-1 rounded-full uppercase tracking-widest font-mono border font-normal ${
                season.status === 'underway' || season.status === 'active'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 font-bold'
                  : season.status === 'upcoming' 
                  ? 'bg-white/5 border-white/20 text-white' 
                  : 'bg-neutral-900/50 border-neutral-800 text-neutral-500'
              }`}>
                {season.status}
              </span>
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        {season.id !== 's-1' && season.status !== 'upcoming' && (
          <div className="flex border-b border-neutral-900 bg-neutral-950/50 w-full">
            <button
              onClick={() => setActiveTab('fixtures')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs sm:text-sm font-mono tracking-wider transition-colors duration-200 border-b-2 ${
                activeTab === 'fixtures' 
                  ? 'border-white text-white font-medium' 
                  : 'border-transparent text-neutral-450 hover:text-neutral-200'
              }`}
            >
              <Calendar size={14} />
              FIXTURES & RESULTS
            </button>
            
            <button
              onClick={() => setActiveTab('table')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs sm:text-sm font-mono tracking-wider transition-colors duration-200 border-b-2 ${
                activeTab === 'table' 
                  ? 'border-white text-white font-medium' 
                  : 'border-transparent text-neutral-450 hover:text-neutral-200'
              }`}
            >
              <Trophy size={14} />
              POINTS TABLE
            </button>
          </div>
        )}

        {/* Modal Scroll Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-neutral-950 space-y-6">
          
          {/* Season Placements View */}
          {placementsConfig[season.id] && (
            <div className={`flex flex-col items-center justify-center py-4 max-w-md mx-auto space-y-6 animate-text-reveal-anim ${
              season.id !== 's-1' ? 'border-b border-neutral-900 pb-6 mb-2' : ''
            }`}>
              <div className="text-center space-y-1">
                <Trophy className="w-10 h-10 text-white mx-auto mb-1" />
                <h3 className="text-lg font-bold tracking-tight text-white uppercase font-mono">Tournament Placements</h3>
                <p className="text-[10px] text-neutral-500 font-mono">Official placements archive</p>
              </div>

              <div className="w-full space-y-3">
                {placementsConfig[season.id].map((place) => {
                  const team = teamsMap[place.teamId];
                  return (
                    <div 
                      key={place.pos}
                      className="flex items-center justify-between p-3.5 bg-neutral-900/20 border border-neutral-900 rounded hover:border-neutral-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full border flex items-center justify-center font-mono text-[10px] ${place.color}`}>
                          {place.pos}
                        </span>
                        <div className="flex items-center gap-2.5">
                          {renderTeamBadge(team)}
                          <span className="font-semibold text-white text-xs tracking-tight">{team?.name || 'Unknown'}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded">
                        {place.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}



          {/* Tab 1: Fixtures & Results */}
          {season.id !== 's-1' && activeTab === 'fixtures' && (
            <div className="space-y-6">

              {/* Champions & Top Scorer Header Card (if defined) */}
              {(season.championId || season.topScorer) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-text-reveal-anim">
                  
                  {/* Champion Card */}
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
                        {champTeam?.logo && (
                          <img 
                            src={champTeam.logo} 
                            alt={champTeam.shortName} 
                            className="w-8 h-8 rounded-full object-cover border border-neutral-800"
                          />
                        )}
                      </div>
                    );
                  })()}

                  {/* Top Scorer Card */}
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
              {sortedMatches.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 font-mono text-sm">
                  No fixtures generated for this season yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-1">
                  {sortedMatches.map((match) => {
                    const t1 = teamsMap[match.team1Id];
                    const t2 = teamsMap[match.team2Id];
                    const isCompleted = match.status === 'completed';
                    const isLive = match.status === 'live';
                    
                    const score1 = Number(match.score1);
                    const score2 = Number(match.score2);
                    const t1Won = isCompleted && score1 > score2;
                    const t2Won = isCompleted && score2 > score1;
                    const isDraw = isCompleted && score1 === score2;

                    return (
                      <div 
                        key={match.id}
                        className="group flex flex-col md:flex-row items-center justify-between p-5 bg-neutral-900/30 hover:bg-neutral-900/50 border border-neutral-900 hover:border-neutral-800 rounded-lg transition-all duration-300 gap-4"
                      >
                        {/* Match Details */}
                        <div className="flex flex-col items-center md:items-start order-2 md:order-1 shrink-0">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest bg-neutral-900/60 px-2.5 py-1 rounded border border-neutral-900/80">
                            {match.stage}
                          </span>
                        </div>

                        {/* Match Score / Teams */}
                        <div className="flex items-center justify-center gap-4 md:gap-8 order-1 md:order-2 flex-1 max-w-lg">
                          
                          {/* Team 1 */}
                          <div className="flex flex-col items-end w-1/3">
                            <div className="flex items-center gap-3 justify-end w-full">
                              <span className={`text-sm md:text-base font-semibold tracking-tight text-right ${
                                isCompleted && !t1Won && !isDraw ? 'text-neutral-500 font-normal' : 'text-white'
                              }`}>
                                {t1?.name || 'Deleted Team'}
                              </span>
                              {renderTeamBadge(t1)}
                            </div>
                            {match.scorers?.[match.team1Id] && match.scorers[match.team1Id].length > 0 && (
                              <span className="text-[10px] text-neutral-500 font-mono mt-1.5 pr-10 text-right leading-none">
                                {formatScorers(match.scorers[match.team1Id])}
                              </span>
                            )}
                          </div>

                          {/* Score Box */}
                          <div className="flex flex-col items-center justify-center min-w-[70px]">
                            {isCompleted ? (
                              <div className="flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded text-sm md:text-base font-mono font-bold tracking-widest text-white shadow-inner">
                                <span className={t1Won ? 'text-white' : 'text-neutral-400'}>{score1}</span>
                                <span className="text-neutral-600">:</span>
                                <span className={t2Won ? 'text-white' : 'text-neutral-400'}>{score2}</span>
                              </div>
                            ) : isLive ? (
                              <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center gap-2 bg-white/5 border border-red-800/40 px-3 py-1.5 rounded text-sm md:text-base font-mono font-bold tracking-widest text-red-500 animate-pulse">
                                  <span>{score1}</span>
                                  <span className="text-neutral-500">:</span>
                                  <span>{score2}</span>
                                </div>
                                <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest font-bold mt-1.5 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                                  LIVE
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs font-mono text-neutral-400 bg-neutral-900 border border-neutral-900 px-3 py-1.5 rounded uppercase tracking-wider">
                                VS
                              </div>
                            )}
                          </div>

                          {/* Team 2 */}
                          <div className="flex flex-col items-start w-1/3">
                            <div className="flex items-center gap-3 justify-start w-full">
                              {renderTeamBadge(t2)}
                              <span className={`text-sm md:text-base font-semibold tracking-tight text-left ${
                                isCompleted && !t2Won && !isDraw ? 'text-neutral-500 font-normal' : 'text-white'
                              }`}>
                                {t2?.name || 'Deleted Team'}
                              </span>
                            </div>
                            {match.scorers?.[match.team2Id] && match.scorers[match.team2Id].length > 0 && (
                              <span className="text-[10px] text-neutral-500 font-mono mt-1.5 pl-10 text-left leading-none">
                                {formatScorers(match.scorers[match.team2Id])}
                              </span>
                            )}
                          </div>

                        </div>

                        {/* Match Status / Winner Callout */}
                        <div className="flex flex-col items-center md:items-end order-3">
                          {isCompleted ? (
                            <span className="text-xs font-mono text-neutral-500 border border-neutral-900 px-2 py-0.5 rounded">
                              {t1Won ? `${t1?.shortName} Win` : t2Won ? `${t2?.shortName} Win` : 'Drawn'}
                            </span>
                          ) : isLive ? (
                            <span className="text-xs font-mono text-red-500 border border-red-950/30 bg-red-950/10 px-2.5 py-0.5 rounded tracking-wider uppercase font-bold">
                              In Progress
                            </span>
                          ) : (
                            <span className="text-xs font-mono text-neutral-500 border border-neutral-900 px-2 py-0.5 rounded tracking-wider uppercase">
                              Upcoming
                            </span>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Points Table */}
          {season.id !== 's-1' && activeTab === 'table' && (
            <div className="space-y-10">
              
              {/* Group Toppers / Qualified Quarterfinalists Showcase */}
              {season.status !== 'upcoming' && standings && Object.keys(standings).length > 0 && (
                <div className="bg-neutral-900/10 border border-neutral-900 p-5 rounded-lg space-y-4 animate-text-reveal-anim">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5 font-bold">
                      <Trophy size={13} className="text-[#D4AF37]" /> {season.id === 's-4' ? 'Qualified Quarter-Finalists (8 Teams)' : 'Group Toppers (Leaders)'}
                    </span>
                    {season.id === 's-4' && (
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded font-bold">
                        Group Stage Concluded
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(standings).sort().map(([groupName, rows]) => {
                      const first = rows[0];
                      const second = rows[1];
                      const team1 = first ? teamsMap[first.teamId] : null;
                      const team2 = second ? teamsMap[second.teamId] : null;
                      return (
                        <div key={groupName} className="bg-neutral-950 p-3 rounded-lg border border-neutral-800/80 space-y-2">
                          <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider block border-b border-neutral-900 pb-1 flex items-center justify-between">
                            <span>{groupName}</span>
                            <span className="text-emerald-400 text-[9px]">Top 2 Advance</span>
                          </span>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-4 h-4 rounded-full bg-emerald-400 text-black text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                                {renderTeamBadge(team1, 'sm')}
                                <span className="text-xs font-bold text-white truncate">{team1?.shortName || team1?.name}</span>
                              </div>
                              <span className="text-[10px] font-mono text-emerald-400 shrink-0 font-bold">{first?.points} pts</span>
                            </div>
                            {second && (
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-4 h-4 rounded-full bg-neutral-900 border border-emerald-700/80 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                                  {renderTeamBadge(team2, 'sm')}
                                  <span className="text-xs font-medium text-neutral-200 truncate">{team2?.shortName || team2?.name}</span>
                                </div>
                                <span className="text-[10px] font-mono text-neutral-400 shrink-0">{second?.points} pts</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {season.id === 's-4' && (
                <div className="bg-neutral-900/10 border border-neutral-900 p-5 rounded-lg space-y-4 animate-text-reveal-anim">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5 font-bold">
                      <Trophy size={13} className="text-[#D4AF37]" /> Official Quarter-Final Matchups
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded font-bold">
                      Knockout Stage
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { qf: 'QF 1', t1: 't-1', t2: 't-6' },
                      { qf: 'QF 2', t1: 't-11', t2: 't-2' },
                      { qf: 'QF 3', t1: 't-10', t2: 't-9' },
                      { qf: 'QF 4', t1: 't-8', t2: 't-3' }
                    ].map(({ qf, t1, t2 }) => {
                      const team1 = teamsMap[t1];
                      const team2 = teamsMap[t2];
                      return (
                        <div key={qf} className="flex items-center justify-between p-3.5 bg-neutral-950 border border-neutral-800/80 rounded-lg gap-2">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/50 border border-emerald-800/40 px-2 py-1 rounded shrink-0">
                            {qf}
                          </span>
                          <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-center px-1 min-w-0">
                            <div className="flex items-center gap-2 justify-end flex-1 min-w-0">
                              <span className="text-xs font-bold text-white truncate text-right">{team1?.shortName || team1?.name}</span>
                              {renderTeamBadge(team1, 'sm')}
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400 px-2 py-0.5 bg-neutral-900 rounded border border-neutral-800 shrink-0 font-bold">VS</span>
                            <div className="flex items-center gap-2 justify-start flex-1 min-w-0">
                              {renderTeamBadge(team2, 'sm')}
                              <span className="text-xs font-bold text-white truncate text-left">{team2?.shortName || team2?.name}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-500 border border-neutral-800 px-2 py-0.5 rounded shrink-0 uppercase tracking-wider">
                            Upcoming
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {standings && Object.keys(standings).sort().map((groupName) => {
                const groupRows = standings[groupName] || [];
                
                return (
                  <div key={groupName} className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-450 font-bold border-b border-neutral-900 pb-2 flex items-center justify-between">
                      <span>{groupName} Standings</span>
                      <span className="text-[10px] font-normal text-neutral-500">{groupRows.length} Teams</span>
                    </h3>

                    <div className="overflow-x-auto border border-neutral-900 rounded-lg bg-neutral-950">
                      <table className="w-full border-collapse text-left text-sm text-neutral-200">
                        <thead>
                          <tr className="border-b border-neutral-900 bg-neutral-950/80 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                            <th scope="col" className="px-6 py-3 font-normal text-center w-16">Pos</th>
                            <th scope="col" className="px-6 py-3 font-normal">Team</th>
                            <th scope="col" className="px-4 py-3 font-normal text-center">P</th>
                            <th scope="col" className="px-4 py-3 font-normal text-center">W</th>
                            <th scope="col" className="px-4 py-3 font-normal text-center">D</th>
                            <th scope="col" className="px-4 py-3 font-normal text-center">L</th>
                            <th scope="col" className="hidden sm:table-cell px-3 py-3 font-normal text-center">GF</th>
                            <th scope="col" className="hidden sm:table-cell px-3 py-3 font-normal text-center">GA</th>
                            <th scope="col" className="px-4 py-3 font-normal text-center">GD</th>
                            <th scope="col" className="px-6 py-3 font-normal text-center w-24">Pts</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-900/50">
                          {groupRows.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="px-6 py-8 text-center text-neutral-500 font-mono text-xs">
                                No standings recorded in this group.
                              </td>
                            </tr>
                          ) : (
                            groupRows.map((row, idx) => {
                              const team = teamsMap[row.teamId];
                              const isTop2 = season.id === 's-4' && idx < 2;

                              return (
                                <tr 
                                  key={row.teamId}
                                  className="hover:bg-neutral-900/20 transition-colors duration-200"
                                >
                                  <td className="px-6 py-3 text-center font-mono font-medium text-neutral-400">
                                    {idx === 0 ? (
                                      <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded bg-emerald-400 text-black font-bold text-xs shadow-sm">
                                        1
                                      </span>
                                    ) : idx === 1 && season.id === 's-4' ? (
                                      <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded bg-emerald-950 border border-emerald-700/80 text-emerald-400 font-bold text-xs">
                                        2
                                      </span>
                                    ) : (
                                      idx + 1
                                    )}
                                  </td>
                                  <td className="px-6 py-3 font-medium text-white flex items-center gap-3">
                                    {renderTeamBadge(team)}
                                    <span className={`truncate max-w-[140px] sm:max-w-none ${season.id === 's-4' && !isTop2 ? 'text-neutral-400' : 'text-white font-semibold'}`}>{row.name}</span>
                                    {isTop2 && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                                        QF
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-center font-mono text-neutral-300">{row.played}</td>
                                  <td className="px-4 py-3 text-center font-mono text-neutral-300">{row.won}</td>
                                  <td className="px-4 py-3 text-center font-mono text-neutral-300">{row.drawn}</td>
                                  <td className="px-4 py-3 text-center font-mono text-neutral-300">{row.lost}</td>
                                  <td className="hidden sm:table-cell px-3 py-3 text-center font-mono text-neutral-400">{row.goalsFor}</td>
                                  <td className="hidden sm:table-cell px-3 py-3 text-center font-mono text-neutral-400">{row.goalsAgainst}</td>
                                  <td className={`px-4 py-3 text-center font-mono ${
                                    row.goalDifference > 0 
                                      ? 'text-white' 
                                      : row.goalDifference < 0 
                                      ? 'text-neutral-500' 
                                      : 'text-neutral-400'
                                  }`}>
                                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                  </td>
                                  <td className="px-6 py-3 text-center font-mono font-bold text-white text-base">
                                    {row.points}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                    {season.id === 's-4' && (
                      <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 pl-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                        <span className="text-emerald-400 font-semibold">1st &amp; 2nd Place (QF):</span> Qualified for Quarter-Finals
                      </div>
                    )}
                  </div>
                );
              })}

              {season.id === 's-4' && (
                <div className="p-5 bg-emerald-950/20 border border-emerald-900/60 rounded-lg text-[11px] font-mono text-neutral-400 leading-relaxed space-y-2">
                  <span className="font-bold text-emerald-400 uppercase flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Season 4 Group Stage Concluded • Quarter-Finals Next
                  </span>
                  <p className="text-neutral-300">
                    All 18 group stage matches across Groups A, B, C, and D are complete. The top 2 teams from each group have officially punched their tickets to the Knockout Quarter-Finals:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-white font-mono text-[10px]">
                    <div className="bg-neutral-950/90 p-2.5 rounded border border-neutral-800 space-y-1">
                      <span className="text-emerald-400 font-bold block border-b border-neutral-900 pb-0.5">Group A</span>
                      <div className="text-neutral-200">1. AI &amp; DS (7 pts)</div>
                      <div className="text-neutral-300">2. EEE (5 pts)</div>
                    </div>
                    <div className="bg-neutral-950/90 p-2.5 rounded border border-neutral-800 space-y-1">
                      <span className="text-emerald-400 font-bold block border-b border-neutral-900 pb-0.5">Group B</span>
                      <div className="text-neutral-200">1. EC GAMMA (7 pts)</div>
                      <div className="text-neutral-300">2. EC ALPHA (6 pts)</div>
                    </div>
                    <div className="bg-neutral-950/90 p-2.5 rounded border border-neutral-800 space-y-1">
                      <span className="text-emerald-400 font-bold block border-b border-neutral-900 pb-0.5">Group C</span>
                      <div className="text-neutral-200">1. APPLIED (6 pts)</div>
                      <div className="text-neutral-300">2. CS GAMMA (3 pts)</div>
                    </div>
                    <div className="bg-neutral-950/90 p-2.5 rounded border border-neutral-800 space-y-1">
                      <span className="text-emerald-400 font-bold block border-b border-neutral-900 pb-0.5">Group D</span>
                      <div className="text-neutral-200">1. CIVIL (4 pts)</div>
                      <div className="text-neutral-300">2. EC BETA (3 pts)</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Season 2 Rankings Section */}
              {season.id === 's-2' && (
                <div className="space-y-4 pt-6 border-t border-neutral-900 animate-text-reveal-anim">
                  <h3 className="text-sm font-mono uppercase tracking-widest text-[#D4AF37] font-bold flex items-center gap-1.5">
                    <BarChart2 size={14} className="text-[#D4AF37]" /> Season 2 Tournament Rankings
                  </h3>
                  
                  <div className="p-4 bg-neutral-900/10 border border-neutral-900 rounded text-[11px] font-mono text-neutral-400 leading-relaxed space-y-1.5">
                    <span className="font-bold text-white uppercase block">Ranking Rules & Logic:</span>
                    <ul className="list-disc pl-4 space-y-1 text-neutral-450">
                      <li><strong>1st–4th:</strong> Official tournament knockout positions take precedence.</li>
                      <li><strong>5th–8th (Quarter-finalists) & 9th–14th (Group Exits):</strong> Ranked using group-stage stats only: Points Per Match (PPM) &gt; Goal Difference (GD) &gt; Goals Scored (GF) &gt; Alphabetical.</li>
                      <li>PPM = Points ÷ Matches Played (used because groups had different numbers of teams).</li>
                    </ul>
                  </div>

                  <div className="overflow-x-auto border border-neutral-900 rounded-lg bg-neutral-950">
                    <table className="w-full border-collapse text-left text-sm text-neutral-200">
                      <thead>
                        <tr className="border-b border-neutral-900 bg-neutral-950/80 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                          <th scope="col" className="px-6 py-3 font-normal text-center w-16">Pos</th>
                          <th scope="col" className="px-6 py-3 font-normal">Team</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center">MP</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center">W</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center">D</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center">L</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center">GF</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center">GA</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center">GD</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center w-20">Pts</th>
                          <th scope="col" className="px-6 py-3 font-normal text-center w-24 text-white">PPM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900/50">
                        {[
                          { rank: 1, teamId: "t-3", mp: 2, w: 1, d: 1, l: 0, gf: 3, ga: 0, gd: 3, pts: 4, ppm: 2.000, note: "Champion" },
                          { rank: 2, teamId: "t-10", mp: 3, w: 1, d: 2, l: 0, gf: 6, ga: 3, gd: 3, pts: 5, ppm: 1.667, note: "Runner-up" },
                          { rank: 3, teamId: "t-9", mp: 2, w: 2, d: 0, l: 0, gf: 2, ga: 0, gd: 2, pts: 6, ppm: 3.000, note: "3rd Place" },
                          { rank: 4, teamId: "t-14", mp: 3, w: 2, d: 1, l: 0, gf: 4, ga: 2, gd: 2, pts: 7, ppm: 2.333, note: "4th Place" },
                          
                          { rank: 5, teamId: "t-1", mp: 2, w: 1, d: 1, l: 0, gf: 2, ga: 0, gd: 2, pts: 4, ppm: 2.000, note: "QF Exit" },
                          { rank: 6, teamId: "t-12", mp: 3, w: 1, d: 2, l: 0, gf: 4, ga: 1, gd: 3, pts: 5, ppm: 1.667, note: "QF Exit" },
                          { rank: 7, teamId: "t-11", mp: 2, w: 1, d: 0, l: 1, gf: 4, ga: 2, gd: 2, pts: 3, ppm: 1.500, note: "QF Exit" },
                          { rank: 8, teamId: "t-5", mp: 3, w: 1, d: 1, l: 1, gf: 1, ga: 1, gd: 0, pts: 4, ppm: 1.333, note: "QF Exit" },
                          
                          { rank: 9, teamId: "t-13", mp: 3, w: 1, d: 1, l: 1, gf: 3, ga: 2, gd: 1, pts: 4, ppm: 1.333, note: "Group Exit" },
                          { rank: 10, teamId: "t-4", mp: 3, w: 1, d: 1, l: 1, gf: 3, ga: 3, gd: 0, pts: 4, ppm: 1.333, note: "Group Exit" },
                          { rank: 11, teamId: "t-2", mp: 3, w: 1, d: 0, l: 2, gf: 2, ga: 5, gd: -3, pts: 3, ppm: 1.000, note: "Group Exit" },
                          { rank: 12, teamId: "t-6", mp: 2, w: 0, d: 0, l: 2, gf: 1, ga: 5, gd: -4, pts: 0, ppm: 0.000, note: "Group Exit" },
                          { rank: 13, teamId: "t-7", mp: 2, w: 0, d: 0, l: 2, gf: 0, ga: 5, gd: -5, pts: 0, ppm: 0.000, note: "Group Exit" },
                          { rank: 14, teamId: "t-8", mp: 3, w: 0, d: 0, l: 3, gf: 2, ga: 8, gd: -6, pts: 0, ppm: 0.000, note: "Group Exit" }
                        ].map((row) => {
                          const team = teamsMap[row.teamId];
                          return (
                            <tr key={row.teamId} className="hover:bg-neutral-900/20 transition-colors">
                              <td className="px-6 py-3.5 text-center text-neutral-500 font-mono font-medium">{row.rank}</td>
                              <td className="px-6 py-3.5 font-medium text-white flex items-center gap-2">
                                {renderTeamBadge(team)}
                                <span>{team?.name} <span className="text-[10px] text-neutral-500">({team?.shortName})</span></span>
                              </td>
                              <td className="px-4 py-3.5 text-center font-mono">{row.mp}</td>
                              <td className="px-4 py-3.5 text-center font-mono">{row.w}</td>
                              <td className="px-4 py-3.5 text-center font-mono">{row.d}</td>
                              <td className="px-4 py-3.5 text-center font-mono">{row.l}</td>
                              <td className="px-4 py-3.5 text-center font-mono text-neutral-300">{row.gf}</td>
                              <td className="px-4 py-3.5 text-center font-mono text-neutral-500">{row.ga}</td>
                              <td className={`px-4 py-3.5 text-center font-mono ${row.gd > 0 ? 'text-white' : row.gd < 0 ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                {row.gd > 0 ? `+${row.gd}` : row.gd}
                              </td>
                              <td className="px-4 py-3.5 text-center font-mono font-bold text-neutral-200">{row.pts}</td>
                              <td className="px-6 py-3.5 text-center font-mono font-extrabold text-[#D4AF37]">{row.ppm.toFixed(3)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Season 3 Rankings Section */}
              {season.id === 's-3' && (
                <div className="space-y-4 pt-6 border-t border-neutral-900 animate-text-reveal-anim">
                  <h3 className="text-sm font-mono uppercase tracking-widest text-[#D4AF37] font-bold flex items-center gap-1.5">
                    <BarChart2 size={14} className="text-[#D4AF37]" /> Season 3 Tournament Rankings
                  </h3>
                  
                  <div className="p-4 bg-neutral-900/10 border border-neutral-900 rounded text-[11px] font-mono text-neutral-400 leading-relaxed space-y-1.5">
                    <span className="font-bold text-white uppercase block">Ranking Rules & Logic:</span>
                    <ul className="list-disc pl-4 space-y-1 text-neutral-450">
                      <li><strong>1st–3rd:</strong> Official tournament knockout positions take precedence (MECH BETA and EC GAMMA shared 3rd place as there was no 3rd-place play-off).</li>
                      <li><strong>5th–8th (Quarter-finalists) & 9th–13th (Group Exits):</strong> Ranked using group-stage stats only: Points Per Match (PPM) &gt; Goal Difference (GD) &gt; Goals Scored (GF) &gt; Alphabetical.</li>
                      <li>PPM = Points ÷ Matches Played (used because groups had different numbers of teams).</li>
                    </ul>
                  </div>

                  <div className="overflow-x-auto border border-neutral-900 rounded-lg bg-neutral-950">
                    <table className="w-full border-collapse text-left text-sm text-neutral-200">
                      <thead>
                        <tr className="border-b border-neutral-900 bg-neutral-950/80 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                          <th scope="col" className="px-6 py-3 font-normal text-center w-16">Pos</th>
                          <th scope="col" className="px-6 py-3 font-normal">Team</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center">MP</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center">W</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center">D</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center">L</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center">GF</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center">GA</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center">GD</th>
                          <th scope="col" className="px-4 py-3 font-normal text-center w-20">Pts</th>
                          <th scope="col" className="px-6 py-3 font-normal text-center w-24 text-white">PPM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-900/50">
                        {[
                          { rank: 1, teamId: "t-2", mp: 2, w: 1, d: 0, l: 1, gf: 6, ga: 1, gd: 5, pts: 3, ppm: 1.500, note: "Champion" },
                          { rank: 2, teamId: "t-3", mp: 2, w: 2, d: 0, l: 0, gf: 5, ga: 2, gd: 3, pts: 6, ppm: 3.000, note: "Runner-up" },
                          { rank: 3, teamId: "t-10", mp: 2, w: 2, d: 0, l: 0, gf: 4, ga: 0, gd: 4, pts: 6, ppm: 3.000, note: "Shared 3rd" },
                          { rank: 3, teamId: "t-14", mp: 3, w: 2, d: 0, l: 1, gf: 8, ga: 5, gd: 3, pts: 6, ppm: 2.000, note: "Shared 3rd" },
                          
                          { rank: 5, teamId: "t-1", mp: 2, w: 2, d: 0, l: 0, gf: 6, ga: 1, gd: 5, pts: 6, ppm: 3.000, note: "QF Exit" },
                          { rank: 6, teamId: "t-6", mp: 3, w: 2, d: 0, l: 1, gf: 7, ga: 4, gd: 3, pts: 6, ppm: 2.000, note: "QF Exit" },
                          { rank: 7, teamId: "t-9", mp: 2, w: 1, d: 0, l: 1, gf: 2, ga: 2, gd: 0, pts: 3, ppm: 1.500, note: "QF Exit" },
                          { rank: 8, teamId: "t-13", mp: 2, w: 1, d: 0, l: 1, gf: 1, ga: 1, gd: 0, pts: 3, ppm: 1.500, note: "QF Exit" },
                          
                          { rank: 9, teamId: "t-5", mp: 3, w: 2, d: 0, l: 1, gf: 7, ga: 4, gd: 3, pts: 6, ppm: 2.000, note: "Group Exit" },
                          { rank: 10, teamId: "t-7", mp: 2, w: 0, d: 0, l: 2, gf: 5, ga: 9, gd: -4, pts: 0, ppm: 0.000, note: "Group Exit" },
                          { rank: 11, teamId: "t-11", mp: 2, w: 0, d: 0, l: 2, gf: 0, ga: 4, gd: -4, pts: 0, ppm: 0.000, note: "Group Exit" },
                          { rank: 12, teamId: "t-12", mp: 2, w: 0, d: 0, l: 2, gf: 0, ga: 5, gd: -5, pts: 0, ppm: 0.000, note: "Group Exit" },
                          { rank: 13, teamId: "t-8", mp: 3, w: 0, d: 0, l: 3, gf: 1, ga: 10, gd: -9, pts: 0, ppm: 0.000, note: "Group Exit" }
                        ].map((row) => {
                          const team = teamsMap[row.teamId];
                          return (
                            <tr key={row.teamId} className="hover:bg-neutral-900/20 transition-colors">
                              <td className="px-6 py-3.5 text-center text-neutral-500 font-mono font-medium">{row.rank}</td>
                              <td className="px-6 py-3.5 font-medium text-white flex items-center gap-2">
                                {renderTeamBadge(team)}
                                <span>{team?.name} <span className="text-[10px] text-neutral-500">({team?.shortName})</span></span>
                              </td>
                              <td className="px-4 py-3.5 text-center font-mono">{row.mp}</td>
                              <td className="px-4 py-3.5 text-center font-mono">{row.w}</td>
                              <td className="px-4 py-3.5 text-center font-mono">{row.d}</td>
                              <td className="px-4 py-3.5 text-center font-mono">{row.l}</td>
                              <td className="px-4 py-3.5 text-center font-mono text-neutral-300">{row.gf}</td>
                              <td className="px-4 py-3.5 text-center font-mono text-neutral-500">{row.ga}</td>
                              <td className={`px-4 py-3.5 text-center font-mono ${row.gd > 0 ? 'text-white' : row.gd < 0 ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                {row.gd > 0 ? `+${row.gd}` : row.gd}
                              </td>
                              <td className="px-4 py-3.5 text-center font-mono font-bold text-neutral-200">{row.pts}</td>
                              <td className="px-6 py-3.5 text-center font-mono font-extrabold text-[#D4AF37]">{row.ppm.toFixed(3)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}



        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-neutral-900 bg-neutral-950/80">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white border border-neutral-850 hover:border-neutral-700 bg-transparent rounded transition-all duration-200"
          >
            Close Portal
          </button>
        </div>

      </div>
    </div>
  );
}
