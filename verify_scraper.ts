import { createSession, login, fetchTable } from './src/lib/scraper';

async function testScraper() {
  // Test session creation - can't fully test without real credentials
  const session = createSession();
  console.log('Session created, baseURL:', session.defaults.baseURL);
  console.log('Headers:', JSON.stringify(session.defaults.headers, null, 2));
  
  // Test login with placeholder (will fail but shows structure works)
  try {
    await login(session, 'test_user', 'test_pass', '');
    console.log('Login succeeded (unexpected)');
  } catch (e: any) {
    console.log('Login failed as expected:', e.message);
  }
  
  // Test fetchTable - will fail without real table ID and referer
  try {
    const result = await fetchTable(session, 1, 'https://www.agendae.com.ar/');
    console.log('Table fetched, headings:', result.headings.slice(0, 3));
    console.log('Table data rows:', result.data.length);
  } catch (e: any) {
    console.log('Table fetch failed as expected (no real auth):', e.message?.split('\\n')[0]);
  }
}

testScraper();