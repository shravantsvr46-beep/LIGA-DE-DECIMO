'use client';

import { useState, useEffect } from 'react';
import { Trophy, Shield, Plus, Edit2, Trash2, LogOut, Check, X, RefreshCw, Upload } from 'lucide-react';
import { calculateStandings } from '@/utils/standings';

export default function AdminPage() {
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Database state
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [error, setError] = useState('');

  // Active Admin View
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'teams'

  // Form states
  const [activeSeasonId, setActiveSeasonId] = useState('s-4');
  const [editingMatch, setEditingMatch] = useState(null);
  const [matchForm, setMatchForm] = useState({
    team1Id: '',
    team2Id: '',
    score1: '',
    score2: '',
    date: '',
    time: '',
    status: 'upcoming',
    stage: 'Group Stage'
  });

  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({
    name: '',
    shortName: '',
    logo: '',
    group: 'Group A'
  });

  // Load auth token on start
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken === 'session_decimo_2026_authorized') {
      setToken(savedToken);
    }
  }, []);

  // Fetch db when token changes
  useEffect(() => {
    if (token) {
      fetchDb();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchDb = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db');
      if (!res.ok) throw new Error('Could not read database');
      const data = await res.json();
      setDb(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
      } else {
        setAuthError(data.error || 'Login failed');
      }
    } catch (err) {
      setAuthError('Network error connecting to login API');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setDb(null);
  };

  const callAdminApi = async (action, payload) => {
    setMutationLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, ...payload })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Operation failed');
      }

      await fetchDb(); // Reload DB to reflect updates
      return data;
    } catch (err) {
      alert(`Error: ${err.message}`);
      throw err;
    } finally {
      setMutationLoading(false);
    }
  };

  // --- TEAM HANDLERS ---
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 200 * 1024) {
      alert('Logo file size must be less than 200KB to prevent database bloat.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTeamForm(prev => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const saveTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.name || !teamForm.shortName) return;

    const teamPayload = {
      name: teamForm.name,
      shortName: teamForm.shortName,
      logo: teamForm.logo,
      group: teamForm.group || 'Group A'
    };

    if (editingTeam) {
      teamPayload.id = editingTeam.id;
    }

    try {
      await callAdminApi('saveTeam', { team: teamPayload });
      setEditingTeam(null);
      setTeamForm({ name: '', shortName: '', logo: '', group: 'Group A' });
    } catch (err) {}
  };

  const startEditTeam = (team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      shortName: team.shortName,
      logo: team.logo || '',
      group: team.group || 'Group A'
    });
    setActiveTab('teams');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTeam = async (id) => {
    if (!confirm('Are you sure you want to delete this team? This will delete all matches and standing history associated with them!')) return;
    try {
      await callAdminApi('deleteTeam', { id });
    } catch (err) {}
  };

  // --- MATCH HANDLERS ---
  const saveMatch = async (e) => {
    e.preventDefault();
    if (!matchForm.team1Id || !matchForm.team2Id) {
      alert('Please select both teams.');
      return;
    }

    const matchPayload = {
      seasonId: activeSeasonId,
      team1Id: matchForm.team1Id,
      team2Id: matchForm.team2Id,
      score1: matchForm.score1,
      score2: matchForm.score2,
      date: matchForm.date || new Date().toISOString().split('T')[0],
      time: matchForm.time || '15:00',
      status: matchForm.status,
      stage: matchForm.stage
    };

    if (editingMatch) {
      matchPayload.id = editingMatch.id;
    }

    try {
      await callAdminApi('saveMatch', { match: matchPayload });
      setEditingMatch(null);
      setMatchForm({
        team1Id: '',
        team2Id: '',
        score1: '',
        score2: '',
        date: '',
        time: '',
        status: 'upcoming',
        stage: 'Group Stage'
      });
    } catch (err) {}
  };

  const startEditMatch = (match) => {
    setEditingMatch(match);
    setMatchForm({
      team1Id: match.team1Id,
      team2Id: match.team2Id,
      score1: match.score1 === null ? '' : match.score1,
      score2: match.score2 === null ? '' : match.score2,
      date: match.date,
      time: match.time,
      status: match.status,
      stage: match.stage
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteMatch = async (id) => {
    if (!confirm('Are you sure you want to delete this match fixture?')) return;
    try {
      await callAdminApi('deleteMatch', { id });
    } catch (err) {}
  };

  if (!token) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-black bg-grid-pattern px-4">
        <div className="w-full max-w-md p-8 bg-neutral-950 border border-neutral-900 rounded-lg shadow-2xl animate-text-reveal-anim">
          <div className="flex flex-col items-center mb-8">
            <img 
              src="/logos/league/logo.png" 
              alt="LIGA DE DÉCIMO Logo" 
              className="w-12 h-12 rounded object-cover border border-neutral-800 bg-neutral-900 mb-3"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-12 h-12 rounded bg-white flex items-center justify-center font-bold text-black text-xl mb-3 hidden">
              L
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-mono uppercase">ADMIN SECURE ACCESS</h1>
            <p className="text-xs text-[#D4AF37] font-mono tracking-widest mt-1">LIGA DE DÉCIMO</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-neutral-400 mb-2">
                Administrator Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-600 px-4 py-3 rounded text-sm focus:border-white focus:outline-none transition-colors"
                required
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-950/20 border border-red-900/50 rounded text-xs font-mono text-red-500 text-center">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-white text-black font-semibold text-xs uppercase tracking-widest rounded hover:bg-neutral-200 transition-colors disabled:bg-neutral-800 disabled:text-neutral-500"
            >
              {authLoading ? 'Verifying...' : 'Authenticate'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading || !db) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="w-10 h-10 border-t-2 border-white rounded-full animate-spin"></div>
        <span className="mt-4 font-mono text-xs uppercase tracking-widest text-neutral-500">Loading Dashboard...</span>
      </div>
    );
  }

  const activeSeason = db.seasons.find(s => s.id === activeSeasonId);
  const activeSeasonMatches = db.matches.filter(m => m.seasonId === activeSeasonId);

  // Compute live standings preview for this season
  const standingsPreview = calculateStandings(db.matches, db.teams, activeSeasonId, activeSeason?.staticStandings, activeSeason?.groups);

  return (
    <div className="flex-1 bg-black bg-grid-pattern min-h-screen pb-24 selection:bg-neutral-800 selection:text-white">
      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-neutral-900 bg-neutral-950/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img 
            src="/logos/league/logo.png" 
            alt="LIGA DE DÉCIMO Logo" 
            className="w-8 h-8 rounded object-cover border border-neutral-800 bg-neutral-900"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center font-bold text-black text-base hidden">
            L
          </div>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-widest text-white leading-none">ADMIN DASHBOARD</h1>
            <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">Liga de Décimo Control Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <a href="/" className="text-xs font-mono text-neutral-400 hover:text-white transition-colors duration-200">
            View Public Site
          </a>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-800 hover:border-red-900/60 font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:text-red-500 bg-neutral-950/60 rounded transition-all duration-300"
          >
            <LogOut size={12} />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Forms Column (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* TAB SWITCHER */}
          <div className="flex border border-neutral-900 rounded p-1 bg-neutral-950">
            <button
              onClick={() => { setActiveTab('matches'); setEditingMatch(null); }}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest rounded transition-colors ${
                activeTab === 'matches' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Fixtures & Matches
            </button>
            <button
              onClick={() => { setActiveTab('teams'); setEditingTeam(null); }}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest rounded transition-colors ${
                activeTab === 'teams' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Teams Manager
            </button>
          </div>

          {/* FORM: MATCHES */}
          {activeTab === 'matches' && (
            <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-lg">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono border-b border-neutral-900 pb-3 mb-6 flex items-center justify-between">
                <span>{editingMatch ? 'Edit Match Fixture' : 'Create Match Fixture'}</span>
                {editingMatch && (
                  <button 
                    onClick={() => {
                      setEditingMatch(null);
                      setMatchForm({ team1Id: '', team2Id: '', score1: '', score2: '', date: '', time: '', status: 'upcoming', stage: 'Group Stage' });
                    }} 
                    className="text-[10px] uppercase font-mono text-neutral-500 hover:text-white"
                  >
                    Cancel Edit
                  </button>
                )}
              </h3>

              {activeSeason?.staticStandings && activeSeason.staticStandings.length > 0 ? (
                <div className="p-4 bg-yellow-950/20 border border-yellow-800/40 rounded text-xs font-mono text-yellow-500 leading-relaxed">
                  [!WARNING]
                  {activeSeason.name} is configured as a historical season with **static standings**. Adding matches here will not affect public standings calculation unless you clear the static standings list in the database.
                </div>
              ) : (
                <form onSubmit={saveMatch} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Team 1 Selector */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                        Team 1 (Home)
                      </label>
                      <select
                        value={matchForm.team1Id}
                        onChange={(e) => setMatchForm({ ...matchForm, team1Id: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-850 text-white text-xs px-3 py-2.5 rounded focus:border-white focus:outline-none"
                        required
                      >
                        <option value="">Select Team</option>
                        {db.teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>
                        ))}
                      </select>
                    </div>

                    {/* Team 2 Selector */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                        Team 2 (Away)
                      </label>
                      <select
                        value={matchForm.team2Id}
                        onChange={(e) => setMatchForm({ ...matchForm, team2Id: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-850 text-white text-xs px-3 py-2.5 rounded focus:border-white focus:outline-none"
                        required
                      >
                        <option value="">Select Team</option>
                        {db.teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Time */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                        Time
                      </label>
                      <input
                        type="time"
                        value={matchForm.time}
                        onChange={(e) => setMatchForm({ ...matchForm, time: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-850 text-white text-xs px-3 py-2.5 rounded focus:border-white focus:outline-none"
                      />
                    </div>

                    {/* Stage */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                        Stage
                      </label>
                      <select
                        value={matchForm.stage}
                        onChange={(e) => setMatchForm({ ...matchForm, stage: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-850 text-white text-xs px-3 py-2.5 rounded focus:border-white focus:outline-none"
                      >
                        <option value="Group Stage">Group Stage</option>
                        <option value="Quarterfinal">Quarterfinal</option>
                        <option value="Semifinal">Semifinal</option>
                        <option value="Final">Final</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Match Status */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                        Status
                      </label>
                      <select
                        value={matchForm.status}
                        onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-850 text-white text-xs px-3 py-2.5 rounded focus:border-white focus:outline-none"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="live">Live</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* SCORES - Only enabled if LIVE or COMPLETED */}
                  {matchForm.status !== 'upcoming' && (
                    <div className="p-4 bg-neutral-900/50 border border-neutral-900 rounded space-y-4">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-white font-bold block mb-1">
                        Enter Live / Final Scores
                      </span>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-mono uppercase tracking-widest text-neutral-500 mb-1">
                            Team 1 Score
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={matchForm.score1}
                            onChange={(e) => setMatchForm({ ...matchForm, score1: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-850 text-white text-xs px-3 py-2 rounded focus:border-white focus:outline-none font-mono"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono uppercase tracking-widest text-neutral-500 mb-1">
                            Team 2 Score
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={matchForm.score2}
                            onChange={(e) => setMatchForm({ ...matchForm, score2: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-850 text-white text-xs px-3 py-2 rounded focus:border-white focus:outline-none font-mono"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={mutationLoading}
                    className="w-full py-3 bg-white text-black font-semibold text-xs uppercase tracking-widest rounded hover:bg-neutral-200 transition-colors disabled:bg-neutral-800 disabled:text-neutral-500 mt-2"
                  >
                    {mutationLoading ? 'Saving...' : editingMatch ? 'Update Fixture' : 'Create Fixture'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* FORM: TEAMS */}
          {activeTab === 'teams' && (
            <div className="p-6 bg-neutral-950 border border-neutral-900 rounded-lg">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono border-b border-neutral-900 pb-3 mb-6 flex items-center justify-between">
                <span>{editingTeam ? 'Edit Team Details' : 'Register New Team'}</span>
                {editingTeam && (
                  <button 
                    onClick={() => {
                      setEditingTeam(null);
                      setTeamForm({ name: '', shortName: '', logo: '' });
                    }} 
                    className="text-[10px] uppercase font-mono text-neutral-500 hover:text-white"
                  >
                    Cancel Edit
                  </button>
                )}
              </h3>

              <form onSubmit={saveTeam} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                    Team Name (Branch)
                  </label>
                  <input
                    type="text"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full bg-neutral-900 border border-neutral-850 text-white px-3 py-2.5 rounded text-xs focus:border-white focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                    Short Name (Badge Initial)
                  </label>
                  <input
                    type="text"
                    maxLength="5"
                    value={teamForm.shortName}
                    onChange={(e) => setTeamForm({ ...teamForm, shortName: e.target.value })}
                    placeholder="e.g. CSE"
                    className="w-full bg-neutral-900 border border-neutral-850 text-white px-3 py-2.5 rounded text-xs uppercase focus:border-white focus:outline-none transition-colors font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                    League Group
                  </label>
                  <select
                    value={teamForm.group}
                    onChange={(e) => setTeamForm({ ...teamForm, group: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-850 text-white text-xs px-3 py-2.5 rounded focus:border-white focus:outline-none"
                    required
                  >
                    <option value="Group A">Group A</option>
                    <option value="Group B">Group B</option>
                    <option value="Group C">Group C</option>
                    <option value="Group D">Group D</option>
                  </select>
                </div>

                {/* LOGO FILE UPLOADER */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-1.5">
                    Branch Logo Image
                  </label>
                  <div className="flex items-center gap-4">
                    {/* Preview box */}
                    <div className="w-14 h-14 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center overflow-hidden shrink-0">
                      {teamForm.logo ? (
                        <img src={teamForm.logo} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-600">No Logo</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="flex flex-col items-center justify-center border border-dashed border-neutral-800 hover:border-neutral-600 rounded px-4 py-3 cursor-pointer hover:bg-neutral-900/10 transition-colors">
                        <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                          <Upload size={14} />
                          <span>Select logo image</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[9px] font-mono text-neutral-500 mt-1.5 leading-tight">
                        PNG or JPG. Auto-converted to Base64 (max 200KB).
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={mutationLoading}
                  className="w-full py-3 bg-white text-black font-semibold text-xs uppercase tracking-widest rounded hover:bg-neutral-200 transition-colors disabled:bg-neutral-800 disabled:text-neutral-500 mt-2"
                >
                  {mutationLoading ? 'Saving...' : editingTeam ? 'Update Team' : 'Register Team'}
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Right Side: List / Standings Columns (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* SECTION: MATCH MANAGEMENT */}
          {activeTab === 'matches' && (
            <div className="space-y-6">
              
              {/* Season Select Bar */}
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                  Select Season Fixtures
                </span>
                
                <div className="flex border border-neutral-900 rounded bg-neutral-950 p-0.5">
                  {db.seasons.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setActiveSeasonId(s.id); setEditingMatch(null); }}
                      className={`px-3 py-1 text-[11px] font-mono rounded transition-colors ${
                        activeSeasonId === s.id ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-200'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* LIST OF MATCHES */}
              <div className="bg-neutral-950 border border-neutral-900 rounded-lg p-6 space-y-4 max-h-[380px] overflow-y-auto">
                <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold mb-2">
                  Registered Matches / Schedule
                </h4>
                
                {activeSeasonMatches.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500 font-mono text-xs">
                    No matches found for this season.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeSeasonMatches.map(match => {
                      const t1 = db.teams.find(t => t.id === match.team1Id);
                      const t2 = db.teams.find(t => t.id === match.team2Id);

                      return (
                        <div 
                          key={match.id}
                          className="flex items-center justify-between p-3.5 bg-neutral-900/20 hover:bg-neutral-900/40 border border-neutral-900 rounded text-xs transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="font-mono text-[10px] text-neutral-500">{match.stage}</span>
                            <span className="font-mono text-neutral-300 mt-0.5">{match.time} BST</span>
                          </div>

                          <div className="flex items-center justify-center gap-3 font-semibold text-neutral-200">
                            <span className="text-right">{t1?.shortName || '???'}</span>
                            <div className="px-2.5 py-1 bg-neutral-900 rounded border border-neutral-850 font-mono font-bold tracking-widest">
                              {match.status === 'upcoming' ? (
                                <span className="text-neutral-500">VS</span>
                              ) : (
                                <span>{match.score1} : {match.score2}</span>
                              )}
                            </div>
                            <span className="text-left">{t2?.shortName || '???'}</span>
                            
                            {match.status === 'live' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-1" title="Live Match"></span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditMatch(match)}
                              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-900 transition-colors"
                              title="Edit Match / Results"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => deleteMatch(match.id)}
                              className="p-1.5 text-neutral-500 hover:text-red-500 rounded hover:bg-neutral-900 transition-colors"
                              title="Delete Fixture"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* LIVE STANDINGS PREVIEW */}
              <div className="bg-neutral-950 border border-neutral-900 rounded-lg p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold">
                    Computed Standings Preview
                  </h4>
                  <span className="text-[10px] font-mono text-neutral-500">Updated Real-Time</span>
                </div>

                {(() => {
                  const groupedPreview = {};
                  standingsPreview.forEach(row => {
                    let groupName = 'Group A';
                    if (activeSeason?.groups) {
                      const foundGroup = Object.entries(activeSeason.groups).find(([gName, tIds]) => tIds.includes(row.teamId));
                      if (foundGroup) {
                        groupName = foundGroup[0];
                      }
                    } else {
                      const teamObj = db.teams.find(t => t.id === row.teamId);
                      groupName = teamObj?.group || 'Group A';
                    }
                    if (!groupedPreview[groupName]) {
                      groupedPreview[groupName] = [];
                    }
                    groupedPreview[groupName].push(row);
                  });

                  const sortedGroupNames = Object.keys(groupedPreview).sort();

                  if (sortedGroupNames.length === 0) {
                    return (
                      <div className="text-center py-4 text-neutral-500 text-xs font-mono">
                        No standings recorded for this season.
                      </div>
                    );
                  }

                  return sortedGroupNames.map((groupName) => {
                    const groupRows = groupedPreview[groupName] || [];

                    return (
                      <div key={groupName} className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] font-bold block">
                          {groupName} Standings
                        </span>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-mono text-neutral-350">
                            <thead>
                              <tr className="text-neutral-600 border-b border-neutral-900/60 pb-1">
                                <th className="py-1.5 text-center w-8">Pos</th>
                                  <th className="py-1.5">Team</th>
                                  <th className="py-1.5 text-center w-8">P</th>
                                  <th className="py-1.5 text-center w-8">W</th>
                                  <th className="py-1.5 text-center w-8">D</th>
                                  <th className="py-1.5 text-center w-8">L</th>
                                  <th className="py-1.5 text-center w-8">GD</th>
                                  <th className="py-1.5 text-center w-10 text-white">Pts</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-900/40">
                              {groupRows.length === 0 ? (
                                <tr>
                                  <td colSpan={8} className="py-4 text-center text-neutral-500">
                                    No standing data in this group.
                                  </td>
                                </tr>
                              ) : (
                                groupRows.map((row, idx) => (
                                  <tr key={row.teamId} className="hover:bg-neutral-900/20 transition-colors">
                                    <td className="py-2 text-center text-neutral-500 font-medium">{idx + 1}</td>
                                    <td className="py-2 font-medium text-white">
                                      {row.name} <span className="text-[9px] text-neutral-500">({row.shortName})</span>
                                    </td>
                                    <td className="py-2 text-center">{row.played}</td>
                                    <td className="py-2 text-center">{row.won}</td>
                                    <td className="py-2 text-center">{row.drawn}</td>
                                    <td className="py-2 text-center">{row.lost}</td>
                                    <td className={`py-2 text-center ${row.goalDifference > 0 ? 'text-white' : row.goalDifference < 0 ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                                    </td>
                                    <td className="py-2 text-center font-bold text-white">{row.points}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

            </div>
          )}

          {/* SECTION: TEAMS LIST */}
          {activeTab === 'teams' && (
            <div className="bg-neutral-950 border border-neutral-900 rounded-lg p-6 space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold border-b border-neutral-900 pb-3 mb-4">
                Registered Branches & Teams
              </h4>

              <div className="space-y-3">
                {db.teams.map(team => (
                  <div 
                    key={team.id}
                    className="flex items-center justify-between p-4 bg-neutral-900/20 hover:bg-neutral-900/40 border border-neutral-900 rounded transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Logo or placeholder */}
                      <div className="w-10 h-10 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center overflow-hidden">
                        {team.logo ? (
                          <img src={team.logo} alt={team.shortName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-neutral-400">{team.shortName.slice(0, 2)}</span>
                        )}
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold tracking-tight text-white">{team.name}</h5>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">{team.shortName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditTeam(team)}
                        className="p-2 text-neutral-400 hover:text-white rounded hover:bg-neutral-900 transition-colors"
                        title="Edit Team"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => deleteTeam(team.id)}
                        className="p-2 text-neutral-500 hover:text-red-500 rounded hover:bg-neutral-900 transition-colors"
                        title="Delete Team"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
