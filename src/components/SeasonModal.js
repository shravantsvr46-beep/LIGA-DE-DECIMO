'use client';

import { useState } from 'react';
import { X, Calendar, Trophy, BarChart2 } from 'lucide-react';

export default function SeasonModal({ season, onClose, db }) {
  const [activeTab, setActiveTab] = useState('fixtures'); // 'fixtures' | 'table' | 'allTime'

  const formatScorers = (scorerList) => {
    if (!scorerList || scorerList.length === 0) return '';
    const filteredList = scorerList.filter(name => name.toUpperCase() !== 'OG');
    if (filteredList.length === 0) return '';
    const counts = {};
    filteredList.forEach(name => {
      counts[name] = (counts[name] || 0) + 1;
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

  const standings = db.standings[season.id] || [];
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md transition-opacity duration-300">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden animate-text-reveal-anim">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-900 bg-neutral-950">
          <div>
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-mono">Tournament Archive</span>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
              {season.name} 
              <span className={`ml-3 text-xs px-2.5 py-1 rounded-full uppercase tracking-widest font-mono border font-normal ${
                season.status === 'upcoming' 
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
        {season.id !== 's-1' && (
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

          {/* Season 1 Special Winners View */}
          {season.id === 's-1' && (
            <div className="flex flex-col items-center justify-center py-12 max-w-md mx-auto space-y-8 animate-text-reveal-anim">
              <div className="text-center space-y-2">
                <Trophy className="w-12 h-12 text-white mx-auto mb-2" />
                <h3 className="text-xl font-bold tracking-tight text-white uppercase font-mono">Season 1 Placements</h3>
                <p className="text-xs text-neutral-500 font-mono">Official historical standings archive</p>
              </div>

              <div className="w-full space-y-4">
                {[
                  { pos: '1st', teamId: 't-3', label: 'Champion', color: 'bg-white text-black font-bold border-white' },
                  { pos: '2nd', teamId: 't-2', label: 'Runner-up', color: 'bg-neutral-800 text-neutral-200 border-neutral-700' },
                  { pos: '3rd', teamId: 't-10', label: 'Third Place', color: 'bg-neutral-900 text-neutral-400 border-neutral-800' },
                  { pos: '4th', teamId: 't-9', label: 'Fourth Place', color: 'bg-neutral-950 text-neutral-500 border-neutral-900' }
                ].map((place) => {
                  const team = teamsMap[place.teamId];
                  return (
                    <div 
                      key={place.pos}
                      className="flex items-center justify-between p-4 bg-neutral-900/30 border border-neutral-900 rounded-lg hover:border-neutral-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs ${place.color}`}>
                          {place.pos}
                        </span>
                        <div className="flex items-center gap-3">
                          {renderTeamBadge(team)}
                          <span className="font-semibold text-white tracking-tight">{team?.name || 'Unknown'}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded">
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
              
              {/* Group Toppers Showcase */}
              {standings && Object.keys(standings).length > 0 && (
                <div className="bg-neutral-900/10 border border-neutral-900 p-5 rounded-lg space-y-3 animate-text-reveal-anim">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5 font-bold">
                    <Trophy size={12} className="text-[#D4AF37]" /> Group Toppers (Leaders)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                    {Object.entries(standings).sort().map(([groupName, rows]) => {
                      const topper = rows[0];
                      const team = topper ? teamsMap[topper.teamId] : null;
                      return (
                        <div key={groupName} className="flex items-center gap-2.5 bg-neutral-950 p-2.5 rounded border border-neutral-900">
                          {renderTeamBadge(team, 'sm')}
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

              {standings && Object.keys(standings).sort().map((groupName) => {
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
                            <th scope="col" className="px-6 py-3 font-normal text-center w-16">Pos</th>
                            <th scope="col" className="px-6 py-3 font-normal">Team</th>
                            <th scope="col" className="px-4 py-3 font-normal text-center">P</th>
                            <th scope="col" className="px-4 py-3 font-normal text-center">W</th>
                            <th scope="col" className="px-4 py-3 font-normal text-center">D</th>
                            <th scope="col" className="px-4 py-3 font-normal text-center">L</th>
                            <th scope="col" className="px-4 py-3 font-normal text-center">GD</th>
                            <th scope="col" className="px-6 py-3 font-normal text-center w-24">Pts</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-900/50">
                          {groupRows.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="px-6 py-8 text-center text-neutral-500 font-mono text-xs">
                                No standings recorded in this group.
                              </td>
                            </tr>
                          ) : (
                            groupRows.map((row, idx) => {
                              const team = teamsMap[row.teamId];
                              const isLeader = idx === 0;

                              return (
                                <tr 
                                  key={row.teamId}
                                  className="hover:bg-neutral-900/20 transition-colors duration-200"
                                >
                                  <td className="px-6 py-3 text-center font-mono font-medium text-neutral-400">
                                    {isLeader ? (
                                      <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded bg-white text-black font-bold text-xs">
                                        1
                                      </span>
                                    ) : (
                                      idx + 1
                                    )}
                                  </td>
                                  <td className="px-6 py-3 font-medium text-white flex items-center gap-3">
                                    {renderTeamBadge(team)}
                                    <span className="truncate max-w-[140px] sm:max-w-none">{row.name}</span>
                                  </td>
                                  <td className="px-4 py-3 text-center font-mono text-neutral-300">{row.played}</td>
                                  <td className="px-4 py-3 text-center font-mono text-neutral-300">{row.won}</td>
                                  <td className="px-4 py-3 text-center font-mono text-neutral-300">{row.drawn}</td>
                                  <td className="px-4 py-3 text-center font-mono text-neutral-300">{row.lost}</td>
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
                  </div>
                );
              })}
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
