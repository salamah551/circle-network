// app/page.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import LandingClient from './landing-client';

export default function Page() {
  return <LandingClient />;
}
