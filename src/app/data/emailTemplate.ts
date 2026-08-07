/**
 * Email template library.
 *
 * Each template is plain HTML with `{{Field}}` placeholders that get
 * swapped for real values at send time (see `mergeTemplateFields` in
 * WebhookAgentWorkspace.tsx). Keep placeholder names matching the fields
 * your customer objects actually have — Name, Email, City, ContactNumber,
 * Campaign are wired up already; add more by extending both this file and
 * the `mergeTemplateFields` map.
 *
 * To add a template: drop a new object in the array below. Nothing else
 * needs to change — the picker, thumbnail, and preview all read this list.
 */

export interface EmailTemplate {
    id: string
    name: string
    description?: string
    category?: string
    html: string
}

export const emailTemplates: EmailTemplate[] = [
    {
        id: 'creatikai-intro',
        name: 'CreatikAi Introduction',
        description: 'Gradient header intro with a profile-details box and CTA',
        category: 'Outreach',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CreatikAi - Let's Grow Together</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7fb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.06);">
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%); padding: 45px 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 1px;">CreatikAi</h1>
              <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">Next-Generation Digital Solutions</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 35px;">
              <h2 style="margin: 0 0 20px 0; color: #1e293b; font-size: 24px;">Hi {{Name}},</h2>
              <p style="margin: 0 0 25px 0; color: #475569; font-size: 16px; line-height: 1.6;">
  {{AI_CONTENT}}
</p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-left: 4px solid #0ea5e9; border-radius: 6px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Your Profile Details</p>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="30%" style="padding: 6px 0; color: #0f172a; font-weight: 600; font-size: 15px;">Email:</td>
                        <td width="70%" style="padding: 6px 0; color: #475569; font-size: 15px;">{{Email}}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600; font-size: 15px;">Phone:</td>
                        <td style="padding: 6px 0; color: #475569; font-size: 15px;">{{ContactNumber}}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600; font-size: 15px;">City:</td>
                        <td style="padding: 6px 0; color: #475569; font-size: 15px;">{{City}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 35px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Ready to transform your business with AI-driven strategies and a flawless online presence? Let's take the next step together.
              </p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://creatikai.com" target="_blank" style="display: inline-block; padding: 16px 36px; background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%); color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 50px; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(6, 182, 212, 0.3);">
                      Visit CreatikAi
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
                © 2026 CreatikAi. All rights reserved.<br>
                You are receiving this email as part of the {{Campaign}} campaign.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },

    // Add more templates below — same shape, different html.
    // The two below are placeholder starting points so the picker has
    // more than one option; swap the html for your real designs whenever
    // you're ready.
    {
        id: 'simple-follow-up',
        name: 'Simple Follow-up',
        description: 'Minimal plain-style follow-up note',
        category: 'Follow-up',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Following up</title>
</head>
<body style="margin:0; padding:0; background-color:#ffffff; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;">
          <tr>
            <td style="padding-bottom:24px; border-bottom:2px solid #0f172a;">
              <p style="margin:0; font-size:14px; color:#64748b;">Hi {{Name}},</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0; color:#1e293b; font-size:15px; line-height:1.7;">
             <p style="margin:0 0 16px 0;">{{AI_CONTENT}}</p>
              <p style="margin:0;">Best,<br>The Team</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:20px; border-top:1px solid #e2e8f0;">
              <p style="margin:0; font-size:12px; color:#94a3b8;">{{Email}} · {{ContactNumber}} · {{City}}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },
    {
        id: 'promo-offer',
        name: 'Promotional Offer',
        description: 'Bold banner-style promo with a discount callout',
        category: 'Promotional',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Special Offer</title>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background:#111827; border-radius:14px; overflow:hidden;">
          <tr>
            <td align="center" style="padding:50px 20px 30px 20px;">
              <span style="display:inline-block; padding:6px 14px; background:#facc15; color:#111827; font-size:11px; font-weight:800; letter-spacing:1px; border-radius:999px; text-transform:uppercase;">Limited Time</span>
              <h1 style="color:#ffffff; margin:18px 0 0 0; font-size:30px; font-weight:800;">Hi {{Name}}, this one's for you</h1>
              <p style="color:#94a3b8; margin:12px 0 0 0; font-size:15px;">{{AI_CONTENT}}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 30px 40px 30px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#facc15; border-radius:10px;">
                    <a href="#" style="display:block; padding:16px 40px; color:#111827; font-size:16px; font-weight:800; text-decoration:none;">Claim Your Offer</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 30px; background:#1f2937; border-top:1px solid #374151;">
              <p style="margin:0; color:#6b7280; font-size:12px; text-align:center;">
                Sent to {{Email}} · {{ContactNumber}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },
    {
        id: 'creatikai-bold-header',
        name: 'CreatikAi Bold Header',
        description: 'Dark hero with logo badge and clean CTA — good for cold outreach',
        category: 'Outreach',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CreatikAi</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background:#0b1220; border-radius:16px; overflow:hidden;">
          <tr>
            <td align="center" style="padding:44px 30px 32px 30px;">
              <img src="https://creatikai.com/creatikai-logo.png" width="56" height="56" alt="CreatikAi" style="display:block; border-radius:50%; margin-bottom:14px;">
              <h1 style="color:#ffffff; margin:0; font-size:26px; font-weight:800; letter-spacing:0.3px;">Creatik <span style="color:#38bdf8;">AI</span></h1>
              <p style="color:#94a3b8; margin:8px 0 0 0; font-size:13px; letter-spacing:1px; text-transform:uppercase;">AI Automation &amp; Digital Growth</p>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff; padding:36px 32px;">
              <h2 style="margin:0 0 16px 0; color:#0f172a; font-size:21px;">Hi {{Name}},</h2>
              <p style="margin:0 0 24px 0; color:#475569; font-size:15.5px; line-height:1.7;">
                {{AI_CONTENT}}
              </p>
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#0b1220; border-radius:10px;">
                    <a href="https://creatikai.com" target="_blank" style="display:block; padding:14px 32px; color:#ffffff; font-size:14.5px; font-weight:700; text-decoration:none; letter-spacing:0.3px;">Let's Talk →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc; padding:20px 32px; border-top:1px solid #e2e8f0;">
              <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.6;">
                {{Email}} · {{ContactNumber}} · {{City}}<br>
                Part of the {{Campaign}} campaign · © 2026 CreatikAi
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },
    {
        id: 'creatikai-minimal-card',
        name: 'CreatikAi Minimal Card',
        description: 'Small logo header, light and airy, one clean block of copy',
        category: 'Outreach',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CreatikAi</title>
</head>
<body style="margin:0; padding:0; background-color:#ffffff; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;">
          <tr>
            <td style="padding-bottom:28px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:10px;">
                    <img src="https://creatikai.com/creatikai-logo.png" width="34" height="34" alt="CreatikAi" style="display:block; border-radius:50%;">
                  </td>
                  <td style="font-size:16px; font-weight:800; color:#0f172a; vertical-align:middle;">Creatik AI</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:22px; border-bottom:1px solid #e2e8f0;">
              <p style="margin:0; font-size:13px; color:#94a3b8;">Hi {{Name}}, quick note about {{Campaign}}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:26px 0; color:#1e293b; font-size:15.5px; line-height:1.75;">
              <p style="margin:0 0 18px 0;">{{AI_CONTENT}}</p>
              <p style="margin:0;">
                <a href="https://creatikai.com" style="color:#0284c7; font-weight:700; text-decoration:none;">creatikai.com →</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:20px; border-top:1px solid #e2e8f0;">
              <p style="margin:0; font-size:11.5px; color:#94a3b8;">{{Email}} · {{ContactNumber}} · {{City}}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },
    {
        id: 'real-estate-spotlight',
        name: 'Property Spotlight',
        description: 'Emerald/gold real-estate style with a listing-card layout',
        category: 'Real Estate',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Property Spotlight</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f4; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e5e9e4;">
          <tr>
            <td style="background:#0f3d2e; padding:34px 32px;">
              <span style="display:inline-block; padding:5px 12px; background:#d4af37; color:#0f3d2e; font-size:10.5px; font-weight:800; letter-spacing:1px; border-radius:999px; text-transform:uppercase;">Property Spotlight</span>
              <h1 style="color:#ffffff; margin:16px 0 0 0; font-size:24px; font-weight:700;">Hi {{Name}}</h1>
              <p style="color:#a7c4b5; margin:6px 0 0 0; font-size:13.5px;">Handpicked for your search in {{City}}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 24px 0; color:#3f4b45; font-size:15.5px; line-height:1.75;">
                {{AI_CONTENT}}
              </p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f8f6; border-radius:10px; margin-bottom:26px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 4px 0; font-size:11px; color:#7d8a83; text-transform:uppercase; letter-spacing:0.5px; font-weight:700;">Campaign</p>
                    <p style="margin:0; font-size:14.5px; color:#14322a; font-weight:600;">{{Campaign}}</p>
                  </td>
                </tr>
              </table>
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#0f3d2e; border-radius:8px;">
                    <a href="#" style="display:block; padding:14px 30px; color:#ffffff; font-size:14px; font-weight:700; text-decoration:none;">Schedule a Viewing</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f6f8f6; padding:20px 32px; border-top:1px solid #e5e9e4;">
              <p style="margin:0; color:#8a9490; font-size:11.5px;">{{Email}} · {{ContactNumber}} · {{City}}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },
    {
        id: 'saas-launch',
        name: 'SaaS Product Update',
        description: 'Violet gradient, modern app-announcement feel',
        category: 'Product',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Update</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f3ff; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background:#ffffff; border-radius:18px; overflow:hidden; box-shadow:0 10px 30px rgba(124,58,237,0.08);">
          <tr>
            <td align="center" style="background:linear-gradient(135deg,#7c3aed 0%,#a855f7 100%); padding:40px 30px;">
              <span style="display:inline-block; padding:5px 14px; background:rgba(255,255,255,0.18); color:#ffffff; font-size:10.5px; font-weight:700; letter-spacing:1px; border-radius:999px; text-transform:uppercase;">What's New</span>
              <h1 style="color:#ffffff; margin:16px 0 0 0; font-size:26px; font-weight:800;">Hey {{Name}} 👋</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <p style="margin:0 0 26px 0; color:#4b5563; font-size:15.5px; line-height:1.75;">
                {{AI_CONTENT}}
              </p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#7c3aed; border-radius:10px;">
                          <a href="#" style="display:block; padding:14px 34px; color:#ffffff; font-size:14.5px; font-weight:700; text-decoration:none; border-radius:10px;">See What's New</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#faf5ff; padding:20px 32px; border-top:1px solid #ede9fe;">
              <p style="margin:0; color:#a78bfa; font-size:11.5px;">
                {{Email}} · {{City}} · {{Campaign}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },
    {
        id: 'editorial-newsletter',
        name: 'Editorial Newsletter',
        description: 'Serif typography, single-column magazine-style read',
        category: 'Newsletter',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter</title>
</head>
<body style="margin:0; padding:0; background-color:#fbfaf8; font-family:Georgia, 'Times New Roman', serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding:44px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px;">
          <tr>
            <td align="center" style="padding-bottom:26px; border-bottom:2px solid #1c1917;">
              <p style="margin:0; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#78716c;">The Weekly Note</p>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 4px 10px 4px;">
              <h1 style="margin:0 0 6px 0; font-size:26px; color:#1c1917; font-weight:400; line-height:1.3;">Dear {{Name}},</h1>
              <p style="margin:0; font-size:12.5px; color:#a8a29e; font-style:italic;">A note about {{Campaign}}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 4px 34px 4px; color:#292524; font-size:16px; line-height:1.85;">
              {{AI_CONTENT}}
            </td>
          </tr>
          <tr>
            <td style="padding:22px 4px; border-top:1px solid #e7e5e4;">
              <p style="margin:0; font-size:12px; color:#a8a29e; font-family:'Segoe UI', sans-serif;">
                {{Email}} · {{ContactNumber}} · {{City}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },
    {
        id: 'dark-luxury-offer',
        name: 'Dark Luxury Offer',
        description: 'Black and gold premium feel for high-end promos',
        category: 'Promotional',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exclusive Offer</title>
</head>
<body style="margin:0; padding:0; background-color:#000000; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding:44px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background:#0a0a0a; border:1px solid #2a2418; border-radius:12px; overflow:hidden;">
          <tr>
            <td align="center" style="padding:50px 30px 20px 30px;">
              <p style="margin:0 0 14px 0; font-size:11px; letter-spacing:3px; color:#c9a24b; text-transform:uppercase; font-weight:600;">By Invitation Only</p>
              <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:300; font-family:Georgia, serif;">{{Name}}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 40px 34px 40px;">
              <p style="margin:0; color:#c7c7c7; font-size:15px; line-height:1.85; text-align:center;">
                {{AI_CONTENT}}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:44px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border:1px solid #c9a24b; border-radius:2px;">
                    <a href="#" style="display:block; padding:14px 40px; color:#c9a24b; font-size:12.5px; font-weight:700; letter-spacing:1.5px; text-decoration:none; text-transform:uppercase;">Reveal Offer</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 30px; border-top:1px solid #201c14;">
              <p style="margin:0; color:#5c5648; font-size:11px; text-align:center; letter-spacing:0.5px;">
                {{Email}} · {{City}} · {{Campaign}}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },
    {
        id: 'corporate-letter',
        name: 'Corporate Letter',
        description: 'Formal letterhead style — plain, professional, B2B-safe',
        category: 'Formal',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Correspondence</title>
</head>
<body style="margin:0; padding:0; background-color:#ffffff; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; border:1px solid #d6dbe1;">
          <tr>
            <td style="padding:26px 34px; border-bottom:3px solid #1e3a5f;">
              <p style="margin:0; font-size:15px; font-weight:700; color:#1e3a5f; letter-spacing:0.4px;">{{Campaign}}</p>
              <p style="margin:2px 0 0 0; font-size:11px; color:#7a8794;">Official Correspondence</p>
            </td>
          </tr>
          <tr>
            <td style="padding:34px;">
              <p style="margin:0 0 4px 0; font-size:11px; color:#9aa5b1;">To: {{Name}} — {{City}}</p>
              <p style="margin:0 0 22px 0; font-size:11px; color:#9aa5b1;">Ref: {{ReferenceId}}</p>
              <p style="margin:0 0 18px 0; font-size:14.5px; color:#1f2937;">Dear {{Name}},</p>
              <p style="margin:0 0 22px 0; color:#374151; font-size:14.5px; line-height:1.8;">
                {{AI_CONTENT}}
              </p>
              <p style="margin:0; color:#374151; font-size:14.5px; line-height:1.8;">
                Regards,<br>
                <span style="font-weight:600;">The Team</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 34px; background:#f7f9fb; border-top:1px solid #e5e9ee;">
              <p style="margin:0; font-size:11px; color:#9aa5b1;">{{Email}} · {{ContactNumber}}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    },
]

export const getEmailTemplateById = (id: string | null | undefined) =>
    emailTemplates.find((t) => t.id === id)