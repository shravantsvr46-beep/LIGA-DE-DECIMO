import { calculateStandings, calculateAllTimeRankings, sortStandings } from '@/utils/standings';
import { getDb } from '@/utils/dbStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const db = await getDb();
    
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
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
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
