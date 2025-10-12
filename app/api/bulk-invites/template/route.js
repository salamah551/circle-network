import { NextResponse } from 'next/server';

export async function GET() {
  const headers = new Headers({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="bulk_invite_template.csv"'
  });
  const csv = [
    'full_name,email,company,title,notes,code',
    'Jane Doe,jane@example.com,Example Co,Founder,VIP prospect,'
  ].join('\n');
  return new NextResponse(csv, { status: 200, headers });
}
