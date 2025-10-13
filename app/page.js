// app/page.js (SERVER COMPONENT)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import LandingClient from './landing-client';

export default function Page() {
  // Render the Client UI inside a Server wrapper so Next doesn't try to prerender "/"
  return <LandingClient />;
}
