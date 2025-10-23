// app/api/signals/route.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // Demo signals - hard-coded for now
  // In production, this would fetch from a database or external source
  const signals = [
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      text: 'TechCorp launched new enterprise product targeting mid-market SaaS companies'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      text: 'Competitor A hired former Google VP of Sales - expect aggressive enterprise push'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      text: 'Industry leader announces partnership with Microsoft Azure'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      text: 'Startup Y raised $50M Series B - planning international expansion'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      text: 'Major competitor updated pricing model - 20% price increase across all tiers'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      text: 'New compliance regulation announced - affects enterprise software vendors'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      text: 'Industry benchmark report released - average deal size increased 15% YoY'
    },
    {
      timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      text: 'Top competitor spotted hiring for expansion in APAC region'
    }
  ];

  return Response.json(signals);
}
