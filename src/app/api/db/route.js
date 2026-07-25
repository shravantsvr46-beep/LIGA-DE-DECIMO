import fs from 'fs';
import path from 'path';
import { calculateStandings, calculateAllTimeRankings, sortStandings } from '@/utils/standings';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

function readDb() {
  const fileContent = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(fileContent);
}

export async function GET() {
  try {
    const db = readDb();
    
    // Calculate standings for each season and group them
    const standings = {};
    db.seasons.forEach(s => {
      const calculated = calculateStandings(db.matches, db.teams, s.id, s.staticStandings, s.groups);
      
      // Group by team group dynamically
      const groups = {};
      calculated.forEach(row => {
        let groupName = 'Group A';
        if (s.groups) {
          const foundGroup = Object.entries(s.groups).find(([gName, tIds]) => tIds.includes(row.teamId));
          if (foundGroup) {
            groupName = foundGroup[0];
          }
        } else {
          const teamObj = db.teams.find(t => t.id === row.teamId);
          groupName = teamObj?.group || 'Group A';
        }
        
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(row);
      });

      // Sort and save groups dynamically
      const sortedGroups = {};
      Object.keys(groups).sort().forEach(groupName => {
        sortedGroups[groupName] = sortStandings(groups[groupName]);
      });

      standings[s.id] = sortedGroups;
    });

    // Calculate all-time rankings (aggregate all matches + static standings)
    const allTimeRankings = calculateAllTimeRankings(db.matches, db.teams, db.seasons);

    // Return the response, stripping out admin password
    const { adminPassword, ...publicDb } = db;

    return new Response(
      JSON.stringify({
        ...publicDb,
        standings,
        allTimeRankings
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching database:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
