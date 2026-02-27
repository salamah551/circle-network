// lib/briefpoint-processor.js
// AI processing for BriefPoint meeting briefs using OpenAI GPT-4
// SERVER-SIDE ONLY — uses SUPABASE_SERVICE_ROLE_KEY and OPENAI_API_KEY (no NEXT_PUBLIC_ prefix).
// Must only be imported from API routes or server-side code, never from client components.

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const BRIEFPOINT_SYSTEM_PROMPT = `You are BriefPoint, an elite AI meeting intelligence assistant for The Circle Network — a private community of high-net-worth professionals.
Your role is to prepare executives for their upcoming meetings by generating comprehensive, actionable meeting briefs.
Format your response in clean markdown with the following four sections:

## Participant Intelligence
For each participant, provide their role, background, notable achievements, and communication style if known. If participant details are sparse, provide general guidance on how to engage with someone in their role or company.

## Context & Background
Summarize relevant information about the company, industry trends, recent news, and the purpose of the meeting. Provide strategic context that helps the executive walk in informed.

## Strategic Talking Points
List specific questions to ask, key topics to raise, potential objections to anticipate, and how to navigate them. Be concrete and actionable.

## Opportunity Identification
Identify potential partnerships, collaboration areas, upsell opportunities, or strategic alignments that could benefit both parties. Flag any red flags or areas of caution.

Keep the brief concise but comprehensive — an executive should be able to read it in under 5 minutes and feel fully prepared.`;

/**
 * Process a BriefPoint meeting with OpenAI and update the briefpoint_meetings row.
 * Uses service role key for reliable background updates (not subject to user session expiry).
 * @param {Object} options
 * @param {string} options.meetingId - The briefpoint_meetings row ID
 * @param {string} options.title - Meeting title
 * @param {Array} options.participants - Array of participant objects [{name, email, title, company}]
 * @param {string} options.description - Meeting description/agenda
 * @param {string} options.meetingTime - ISO timestamp of meeting
 * @param {string} options.location - Meeting location (optional)
 */
export async function processBriefPointMeeting({ meetingId, title, participants, description, meetingTime, location }) {
  // Use service role key so background updates work even after user session expires
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not configured — BriefPoint meeting will not be processed');
    await supabase.from('briefpoint_meetings').update({
      status: 'failed',
      brief_md: 'AI processing is not configured. Please contact support.',
      updated_at: new Date().toISOString()
    }).eq('id', meetingId);
    return;
  }

  try {
    const openai = new OpenAI({ apiKey });

    // Build user message from meeting details
    const meetingDate = meetingTime ? new Date(meetingTime).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    }) : 'Not specified';

    let userMessage = `Please generate a comprehensive meeting brief for the following meeting:\n\n`;
    userMessage += `**Meeting Title:** ${title || 'Untitled Meeting'}\n`;
    userMessage += `**Date & Time:** ${meetingDate}\n`;
    if (location) userMessage += `**Location:** ${location}\n`;

    if (participants && participants.length > 0) {
      userMessage += `\n**Participants:**\n`;
      participants.forEach((p, i) => {
        userMessage += `${i + 1}. `;
        if (p.name) userMessage += p.name;
        if (p.title) userMessage += `, ${p.title}`;
        if (p.company) userMessage += ` at ${p.company}`;
        if (p.email) userMessage += ` (${p.email})`;
        userMessage += '\n';
      });
    } else {
      userMessage += `\n**Participants:** Not specified\n`;
    }

    if (description) {
      userMessage += `\n**Meeting Agenda / Description:**\n${description}\n`;
    }

    const completion = await openai.chat.completions.create({
      model: process.env.ARC_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: BRIEFPOINT_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      max_tokens: parseInt(process.env.ARC_MAX_TOKENS || '4000', 10),
      temperature: 0.7,
    });

    const briefMd = completion.choices[0]?.message?.content || 'No response generated.';

    await supabase.from('briefpoint_meetings').update({
      status: 'completed',
      brief_md: briefMd,
      updated_at: new Date().toISOString()
    }).eq('id', meetingId);

  } catch (error) {
    console.error('BriefPoint processing error:', error);
    await supabase.from('briefpoint_meetings').update({
      status: 'failed',
      brief_md: `**Error:** Failed to generate your meeting brief. Please try again or contact support.\n\n_Technical details: ${error.message}_`,
      updated_at: new Date().toISOString()
    }).eq('id', meetingId);
  }
}
