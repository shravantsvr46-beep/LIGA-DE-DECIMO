import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

function readDb() {
  const fileContent = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(fileContent);
}

export async function POST(req) {
  try {
    const { password } = await req.json();
    const db = readDb();
    
    if (password === db.adminPassword) {
      return new Response(
        JSON.stringify({ success: true, token: 'session_decimo_2026_authorized' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid password' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error during authentication' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
