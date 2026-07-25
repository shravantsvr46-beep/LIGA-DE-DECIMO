// Standings calculation function - Client & Server Safe
export function calculateStandings(matches, teams, seasonId = null, staticStandings = null, seasonGroups = null) {
  // If static standings are provided for a season, use them directly
  if (seasonId && staticStandings) {
    // Sort static standings just in case
    return [...staticStandings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return a.name.localeCompare(b.name);
    });
  }

  // Initialize standings map for all teams
  const stats = {};
  let filteredTeams = teams;
  if (seasonGroups) {
    const allGroupTeamIds = Object.values(seasonGroups).flat();
    filteredTeams = teams.filter(t => allGroupTeamIds.includes(t.id));
  } else if (seasonId === 's-3') {
    filteredTeams = teams.filter(t => t.id !== 't-4');
  }

  filteredTeams.forEach(t => {
    stats[t.id] = {
      teamId: t.id,
      name: t.name,
      shortName: t.shortName,
      logo: t.logo,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    };
  });

  // If seasonId is specified, only process matches for that season
  // Otherwise, if we are calculating All-Time standings (seasonId = null), 
  // we need to aggregate BOTH matches and static standings from archive seasons.
  const targetMatches = seasonId 
    ? matches.filter(m => m.seasonId === seasonId && m.status === 'completed')
    : matches.filter(m => m.status === 'completed');

  // Process match results
  targetMatches.forEach(m => {
    const t1 = stats[m.team1Id];
    const t2 = stats[m.team2Id];

    if (!t1 || !t2) return;

    t1.played += 1;
    t2.played += 1;

    const s1 = Number(m.score1);
    const s2 = Number(m.score2);

    t1.goalsFor += s1;
    t1.goalsAgainst += s2;
    t2.goalsFor += s2;
    t2.goalsAgainst += s1;

    if (s1 > s2) {
      t1.won += 1;
      t1.points += 3;
      t2.lost += 1;
    } else if (s2 > s1) {
      t2.won += 1;
      t2.points += 3;
      t1.lost += 1;
    } else {
      t1.drawn += 1;
      t1.points += 1;
      t2.drawn += 1;
      t2.points += 1;
    }
  });

  // Calculate goal difference
  Object.values(stats).forEach(s => {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
  });

  // If we are doing All-Time (seasonId = null) and we have access to the DB context,
  // we aggregate static standings from seasons that have them.
  // Note: Since this is helper code, the matches array we pass for All-Time will be matches.
  // We need to aggregate static standings.
  // Because teams has no seasons list, we'll let this run inside the route for all-time
  // by passing the static standings from seasons.
  // Wait! In the previous route code:
  // db.seasons.forEach(s => { if(s.staticStandings) { s.staticStandings.forEach(...) } })
  // To keep this helper clean and detached from db.json reads on the client,
  // let's pass seasons to this function OR handle the static stand merging locally.
  // Let's pass seasons as an optional parameter!
  return Object.values(stats);
}

export function calculateAllTimeRankings(matches, teams, seasons) {
  const stats = {};
  teams.forEach(t => {
    stats[t.id] = {
      teamId: t.id,
      name: t.name,
      shortName: t.shortName,
      logo: t.logo,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    };
  });

  // Process completed matches (dynamic seasons)
  const completedMatches = matches.filter(m => m.status === 'completed');
  completedMatches.forEach(m => {
    const t1 = stats[m.team1Id];
    const t2 = stats[m.team2Id];
    if (!t1 || !t2) return;

    t1.played += 1;
    t2.played += 1;
    const s1 = Number(m.score1);
    const s2 = Number(m.score2);
    t1.goalsFor += s1;
    t1.goalsAgainst += s2;
    t2.goalsFor += s2;
    t2.goalsAgainst += s1;

    if (s1 > s2) {
      t1.won += 1;
      t1.points += 3;
      t2.lost += 1;
    } else if (s2 > s1) {
      t2.won += 1;
      t2.points += 3;
      t1.lost += 1;
    } else {
      t1.drawn += 1;
      t1.points += 1;
      t2.drawn += 1;
      t2.points += 1;
    }
  });

  // Add static standings
  seasons.forEach(s => {
    if (s.staticStandings && s.staticStandings.length > 0) {
      s.staticStandings.forEach(staticRow => {
        const t = stats[staticRow.teamId];
        if (t) {
          t.played += staticRow.played || 0;
          t.won += staticRow.won || 0;
          t.drawn += staticRow.drawn || 0;
          t.lost += staticRow.lost || 0;
          t.goalsFor += staticRow.goalsFor || 0;
          t.goalsAgainst += staticRow.goalsAgainst || 0;
          t.points += staticRow.points || 0;
        }
      });
    }
  });

  // Calculate goal difference and sort
  const list = Object.values(stats).map(s => {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
    return s;
  });

  list.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.name.localeCompare(b.name);
  });

  return list;
}

export function sortStandings(standingsList) {
  return [...standingsList].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.name.localeCompare(b.name);
  });
}
