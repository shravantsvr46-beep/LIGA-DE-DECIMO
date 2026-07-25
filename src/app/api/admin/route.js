import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

function readDb() {
  const fileContent = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(fileContent);
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export async function POST(req) {
  try {
    // 1. Authorize Request
    const authHeader = req.headers.get('authorization');
    if (authHeader !== 'Bearer session_decimo_2026_authorized') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { action } = body;
    const db = readDb();

    if (action === 'saveTeam') {
      const { team } = body;
      if (!team.name || !team.shortName) {
        return new Response(
          JSON.stringify({ error: 'Team name and short name are required.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (team.id) {
        // Update existing team
        const idx = db.teams.findIndex(t => t.id === team.id);
        if (idx !== -1) {
          db.teams[idx] = { ...db.teams[idx], ...team };
        } else {
          return new Response(
            JSON.stringify({ error: 'Team not found.' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // Create new team
        const newTeam = {
          id: `t-${Date.now()}`,
          name: team.name,
          shortName: team.shortName.toUpperCase(),
          logo: team.logo || '',
          group: team.group || 'Group A'
        };
        db.teams.push(newTeam);
      }

      writeDb(db);
      return new Response(
        JSON.stringify({ success: true, message: 'Team saved successfully.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'deleteTeam') {
      const { id } = body;
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Team ID is required.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Remove team
      db.teams = db.teams.filter(t => t.id !== id);
      // Remove all matches involving this team
      db.matches = db.matches.filter(m => m.team1Id !== id && m.team2Id !== id);

      writeDb(db);
      return new Response(
        JSON.stringify({ success: true, message: 'Team and associated matches deleted.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'saveMatch') {
      const { match } = body;
      if (!match.seasonId || !match.team1Id || !match.team2Id) {
        return new Response(
          JSON.stringify({ error: 'Missing required match fields.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (match.team1Id === match.team2Id) {
        return new Response(
          JSON.stringify({ error: 'A team cannot play against itself.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const score1 = match.status === 'upcoming' ? null : (match.score1 === '' || match.score1 === null ? 0 : Number(match.score1));
      const score2 = match.status === 'upcoming' ? null : (match.score2 === '' || match.score2 === null ? 0 : Number(match.score2));

      if (match.id) {
        // Update match
        const idx = db.matches.findIndex(m => m.id === match.id);
        if (idx !== -1) {
          db.matches[idx] = {
            ...db.matches[idx],
            team1Id: match.team1Id,
            team2Id: match.team2Id,
            score1,
            score2,
            date: match.date || '2026-08-01',
            time: match.time || '15:00',
            status: match.status || 'upcoming',
            stage: match.stage || 'Group Stage'
          };
        } else {
          return new Response(
            JSON.stringify({ error: 'Match not found.' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } else {
        // Create new match
        const newMatch = {
          id: `m-s4-${Date.now()}`,
          seasonId: match.seasonId,
          team1Id: match.team1Id,
          team2Id: match.team2Id,
          score1,
          score2,
          date: match.date || '2026-08-01',
          time: match.time || '15:00',
          status: match.status || 'upcoming',
          stage: match.stage || 'Group Stage'
        };
        db.matches.push(newMatch);
      }

      writeDb(db);
      return new Response(
        JSON.stringify({ success: true, message: 'Match saved successfully.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'deleteMatch') {
      const { id } = body;
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Match ID is required.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      db.matches = db.matches.filter(m => m.id !== id);
      writeDb(db);

      return new Response(
        JSON.stringify({ success: true, message: 'Match deleted successfully.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin mutation error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error processing request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
