// lib/arc-processor.js
// AI processing for ARC™ requests using OpenAI GPT-4
//
// Required environment variables:
//   OPENAI_API_KEY — Your OpenAI API key for GPT-4
//
// Optional environment variables:
//   ARC_MODEL         — Model to use (default: 'gpt-4o')
//   ARC_MAX_TOKENS    — Max tokens per response (default: 4000)
//   ARC_LIMIT_FOUNDING    — Monthly request limit for founding members (default: 100)
//   ARC_LIMIT_ELITE       — Monthly request limit for elite members (default: 50)
//   ARC_MAX_FILE_SIZE_MB  — Max file upload size in MB (default: 20)
//   ARC_STORAGE_BUCKET    — Supabase storage bucket name (default: 'arc-uploads')

import OpenAI from 'openai';

const TYPE_SYSTEM_PROMPTS = {
  brief: `You are ARC™, an elite AI research analyst for The Circle Network — a private community of high-net-worth professionals. 
You produce executive-quality briefs that are concise, actionable, and data-driven.
Format your response in clean markdown with headers, bullet points, and bold key insights.
Always include: Executive Summary, Key Findings, Actionable Recommendations, and Risk Factors where applicable.`,

  travel: `You are ARC™, an elite AI travel concierge for The Circle Network — a private community of high-net-worth professionals.
You optimize travel experiences for busy executives. Provide specific, actionable advice.
Format your response in clean markdown.
Cover: Route Optimization, Upgrade Strategies, Lounge Access, and Time-Saving Tips where applicable.`,

  intel: `You are ARC™, an elite AI market intelligence analyst for The Circle Network — a private community of high-net-worth professionals.
You deliver sharp competitive and market intelligence. Be specific with data points and trends.
Format your response in clean markdown.
Cover: Market Overview, Competitive Landscape, Key Trends, Strategic Implications, and Recommended Actions.`
};

/**
 * Process an ARC request with OpenAI and update the arc_requests row.
 * @param {Object} options
 * @param {string} options.requestId - The arc_requests row ID
 * @param {string} options.prompt - The user's request text
 * @param {string} options.type - Request type: 'brief', 'travel', or 'intel'
 * @param {string[]} options.attachmentTexts - Text content extracted from uploaded files
 * @param {Object} options.supabase - Supabase client instance
 */
export async function processArcRequest({ requestId, prompt, type, attachmentTexts, supabase }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not configured — ARC request will not be processed');
    await supabase.from('arc_requests').update({
      status: 'failed',
      result_md: 'AI processing is not configured. Please contact support.',
      updated_at: new Date().toISOString()
    }).eq('id', requestId);
    return;
  }

  try {
    const openai = new OpenAI({ apiKey });

    let userMessage = prompt;
    if (attachmentTexts && attachmentTexts.length > 0) {
      userMessage += '\n\n---\nAttached document contents:\n\n';
      attachmentTexts.forEach((text, i) => {
        userMessage += `**Document ${i + 1}:**\n${text}\n\n`;
      });
    }

    const completion = await openai.chat.completions.create({
      model: process.env.ARC_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: TYPE_SYSTEM_PROMPTS[type] || TYPE_SYSTEM_PROMPTS.brief },
        { role: 'user', content: userMessage }
      ],
      max_tokens: parseInt(process.env.ARC_MAX_TOKENS || '4000', 10),
      temperature: 0.7,
    });

    const resultMd = completion.choices[0]?.message?.content || 'No response generated.';

    await supabase.from('arc_requests').update({
      status: 'completed',
      result_md: resultMd,
      updated_at: new Date().toISOString()
    }).eq('id', requestId);

  } catch (error) {
    console.error('ARC processing error:', error);
    await supabase.from('arc_requests').update({
      status: 'failed',
      result_md: `**Error:** Failed to process your request. Please try again or contact support.\n\n_Technical details: ${error.message}_`,
      updated_at: new Date().toISOString()
    }).eq('id', requestId);
  }
}
