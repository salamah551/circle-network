/**
 * HTML Email Layout & Markdown Converter
 *
 * Provides branded HTML email templates for The Circle Network.
 * Uses dark theme with gold accents to match the site aesthetic.
 */

/**
 * Convert basic Markdown to HTML for use in email bodies.
 *
 * Supported syntax:
 *   - Headings: `# H1`, `## H2`, `### H3`
 *   - Bold: `**text**` (rendered in gold)
 *   - Italic: `*text*`
 *   - Links: `[label](url)`
 *   - Horizontal rules: `---`
 *   - Paragraphs separated by blank lines
 *   - Line breaks within paragraphs
 *
 * Note: This is a minimal converter designed for email-safe HTML and does not
 * support the full CommonMark specification (no tables, code blocks, etc.).
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown
    // Headings
    .replace(/^### (.+)$/gm, '<h3 style="color:#D4AF37;font-size:18px;font-weight:600;margin:24px 0 8px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#D4AF37;font-size:22px;font-weight:600;margin:28px 0 10px;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:#D4AF37;font-size:26px;font-weight:700;margin:0 0 16px;">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#D4AF37;">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" style="color:#D4AF37;text-decoration:underline;">$1</a>'
    )
    // Horizontal rules
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #3f3f46;margin:24px 0;">')
    // Line breaks within paragraphs
    .replace(/\n\n/g, '</p><p style="margin:0 0 16px;line-height:1.7;color:#d4d4d8;">')
    .replace(/\n/g, '<br>');

  // Wrap in paragraph tags
  html = `<p style="margin:0 0 16px;line-height:1.7;color:#d4d4d8;">${html}</p>`;

  return html;
}

/**
 * Wrap email content in the branded Circle Network email layout.
 *
 * @param content - Inner HTML content (already converted from markdown)
 * @param preheader - Short preview text shown in email client inbox list
 */
export function wrapInEmailLayout(content: string, preheader = ''): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';

  // Concentric circles SVG logo matching the site's brand mark
  const logoSvg = `
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" stroke="#D4AF37" stroke-width="1.5" fill="none"/>
      <circle cx="24" cy="24" r="15" stroke="#D4AF37" stroke-width="1.5" fill="none"/>
      <circle cx="24" cy="24" r="8"  stroke="#D4AF37" stroke-width="1.5" fill="none"/>
      <circle cx="24" cy="24" r="2.5" fill="#D4AF37"/>
    </svg>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>The Circle Network</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#09090b;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:0 0 32px;">
              <a href="${appUrl}" style="text-decoration:none;display:inline-block;">
                ${logoSvg}
                <div style="margin-top:12px;color:#D4AF37;font-size:13px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;">The Circle Network</div>
              </a>
            </td>
          </tr>

          <!-- Main content card -->
          <tr>
            <td style="background-color:#18181b;border:1px solid #27272a;border-radius:12px;padding:40px 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color:#d4d4d8;font-size:16px;line-height:1.7;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:32px 0 0;color:#52525b;font-size:12px;line-height:1.6;">
              <p style="margin:0 0 8px;">
                &copy; ${new Date().getFullYear()} The Circle Network. All rights reserved.
              </p>
              <p style="margin:0;">
                <a href="${appUrl}" style="color:#71717a;text-decoration:underline;">thecirclenetwork.org</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
