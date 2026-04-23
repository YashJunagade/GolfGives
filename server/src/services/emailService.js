const FROM_RAW   = process.env.EMAIL_FROM || 'GolfGives <junagadeyash1900@gmail.com>';
const FROM_MATCH = FROM_RAW.match(/^(.+?)\s*<(.+)>$/);
const FROM       = FROM_MATCH
  ? { name: FROM_MATCH[1].trim(), email: FROM_MATCH[2].trim() }
  : { email: FROM_RAW };
const URL = process.env.CLIENT_URL || 'http://localhost:5173';

const send = async ({ to, subject, html }) => {
  if (!process.env.BREVO_API_KEY) return;
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sender: FROM, to: [{ email: to }], subject, htmlContent: html }),
    });
    if (!res.ok) console.error('[email]', await res.text());
  } catch (err) {
    console.error('[email]', err.message);
  }
};

/* ─── Shared layout ──────────────────────────────────────────────────────── */

const layout = ({ preheader = '', body }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GolfGives</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#07060a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#07060a;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

          <!-- Logo bar -->
          <tr>
            <td style="padding-bottom:28px;text-align:center;">
              <span style="font-size:22px;font-weight:900;letter-spacing:-0.04em;color:#ffffff;">
                Golf<span style="color:#f59e0b;">Gives</span>
              </span>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background:linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02));border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:40px 36px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.25);">
                GolfGives · Golf. Win. Give.
              </p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.18);">
                You received this email because you have an account at GolfGives.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

const badge = (text, color = '#f59e0b', bg = 'rgba(245,158,11,0.12)') =>
  `<span style="display:inline-block;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${color};background:${bg};padding:4px 12px;border-radius:20px;margin-bottom:20px;">${text}</span>`;

const heading = (text) =>
  `<h1 style="margin:0 0 14px;font-size:26px;font-weight:900;letter-spacing:-0.03em;line-height:1.15;color:#ffffff;">${text}</h1>`;

const para = (text) =>
  `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6);">${text}</p>`;

const cta = (href, text, color = '#f59e0b', textColor = '#07060a') =>
  `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
    <tr>
      <td style="border-radius:10px;background:${color};">
        <a href="${href}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:${textColor};text-decoration:none;border-radius:10px;">${text}</a>
      </td>
    </tr>
  </table>`;

const divider = () =>
  `<div style="height:1px;background:rgba(255,255,255,0.08);margin:24px 0;"></div>`;

const numberBall = (n) =>
  `<span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:rgba(245,158,11,0.12);border:1.5px solid rgba(245,158,11,0.4);color:#f59e0b;font-weight:800;font-size:14px;margin:3px;">${n}</span>`;

const infoRow = (label, value) =>
  `<tr>
    <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px;color:rgba(255,255,255,0.4);">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:13px;font-weight:600;color:#ffffff;text-align:right;">${value}</td>
  </tr>`;

/* ─── Emails ─────────────────────────────────────────────────────────────── */

export const sendWelcome = (email, name) =>
  send({
    to: email,
    subject: `Welcome to GolfGives, ${name || 'there'} 👋`,
    html: layout({
      preheader: 'Your account is ready. Subscribe to start playing and giving.',
      body: `
        ${badge('Welcome')}
        ${heading(`Great to have you, ${name || 'there'}!`)}
        ${para('GolfGives combines your love of golf with real charitable impact. Every month, subscribers compete in draws, win prizes, and support a charity of their choice.')}
        ${divider()}
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
          ${infoRow('Enter monthly draws', '✓ Included')}
          ${infoRow('Track your golf scores', '✓ Included')}
          ${infoRow('Support your charity', '✓ Min 10% of subscription')}
        </table>
        ${para('Choose a subscription plan to get started — monthly or yearly (discounted).')}
        ${cta(`${URL}/pricing`, 'View Plans →')}
      `,
    }),
  });

export const sendSubscriptionConfirmation = (email, name, plan) =>
  send({
    to: email,
    subject: "You're in — subscription confirmed ✓",
    html: layout({
      preheader: `Your ${plan} subscription is now active.`,
      body: `
        ${badge('Subscription Active', '#34d399', 'rgba(52,211,153,0.12)')}
        ${heading("You're officially a GolfGives member!")}
        ${para(`Hi ${name || 'there'}, your <strong style="color:#ffffff;">${plan}</strong> subscription is now active. You're automatically entered into this month's draw.`)}
        ${divider()}
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
          ${infoRow('Plan', plan.charAt(0).toUpperCase() + plan.slice(1))}
          ${infoRow('Draw entry', 'This month')}
          ${infoRow('Charity contribution', 'Min 10% monthly')}
        </table>
        ${para('Head to your dashboard to enter scores, choose your charity, and track your draws.')}
        ${cta(`${URL}/dashboard`, 'Go to Dashboard →')}
      `,
    }),
  });

export const sendSubscriptionCancelled = (email, name, periodEnd) => {
  const endDate = periodEnd
    ? new Date(periodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'the end of your billing period';
  return send({
    to: email,
    subject: 'Your GolfGives subscription has been cancelled',
    html: layout({
      preheader: `Your subscription remains active until ${endDate}.`,
      body: `
        ${badge('Subscription Cancelled', '#f87171', 'rgba(248,113,113,0.1)')}
        ${heading('We\'re sorry to see you go')}
        ${para(`Hi ${name || 'there'}, your subscription has been cancelled. You'll retain full access to GolfGives until <strong style="color:#ffffff;">${endDate}</strong>, including any draws in that period.`)}
        ${divider()}
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
          ${infoRow('Access until', endDate)}
          ${infoRow('Draw entries', 'Active until access ends')}
          ${infoRow('Charity contributions', 'Active until access ends')}
        </table>
        ${para('Changed your mind? You can reactivate your subscription at any time from the pricing page.')}
        ${cta(`${URL}/pricing`, 'Reactivate →', 'rgba(255,255,255,0.1)', '#ffffff')}
      `,
    }),
  });
};

export const sendDrawPublished = (email, name, month, year, drawn) =>
  send({
    to: email,
    subject: `🎰 The ${month} ${year} draw results are in`,
    html: layout({
      preheader: `Winning numbers: ${drawn.join(', ')} — did you win?`,
      body: `
        ${badge(`${month} ${year} Draw`)}
        ${heading('The draw results are in!')}
        ${para(`Hi ${name || 'there'}, this month's draw has been published. The winning numbers are:`)}
        <div style="margin:20px 0;padding:20px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:14px;text-align:center;">
          ${(drawn || []).map(numberBall).join('')}
        </div>
        ${para('Log in to check your scores against the winning numbers and see if you have a matching combination.')}
        ${cta(`${URL}/draws`, 'View My Results →')}
      `,
    }),
  });

export const sendWinnerAlert = (email, name, matchType, prize) =>
  send({
    to: email,
    subject: `🏆 Congratulations — you won £${prize}!`,
    html: layout({
      preheader: `You matched ${matchType} numbers and won £${prize}. Submit your proof to claim.`,
      body: `
        ${badge('You\'re a Winner! 🏆', '#f59e0b', 'rgba(245,158,11,0.12)')}
        ${heading(`You won £${prize}!`)}
        ${para(`Amazing, ${name || 'there'}! You matched <strong style="color:#ffffff;">${matchType} numbers</strong> in this month's draw and have won <strong style="color:#f59e0b;font-size:18px;">£${prize}</strong>.`)}
        ${divider()}
        ${para('To claim your prize, submit a screenshot of your golf scores from the platform as proof. Once approved by our team, payment will be processed promptly.')}
        <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:18px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5);font-weight:600;text-transform:uppercase;letter-spacing:0.07em;">How to claim</p>
          <p style="margin:8px 0 4px;font-size:14px;color:rgba(255,255,255,0.7);">1. Go to the Draws page</p>
          <p style="margin:4px 0 4px;font-size:14px;color:rgba(255,255,255,0.7);">2. Find this month's draw</p>
          <p style="margin:4px 0 0;font-size:14px;color:rgba(255,255,255,0.7);">3. Upload a screenshot of your scores</p>
        </div>
        ${cta(`${URL}/draws`, 'Submit Proof →')}
      `,
    }),
  });

export const sendSubmissionReviewed = (email, name, status, prize) =>
  status === 'approved'
    ? send({
        to: email,
        subject: '✅ Proof approved — your payment is on the way',
        html: layout({
          preheader: `Your prize of £${prize} has been approved and will be paid out shortly.`,
          body: `
            ${badge('Proof Approved', '#34d399', 'rgba(52,211,153,0.12)')}
            ${heading('Your proof has been approved!')}
            ${para(`Great news, ${name || 'there'}! Our team has reviewed your submission and confirmed your win.`)}
            ${divider()}
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
              ${infoRow('Prize amount', `£${prize}`)}
              ${infoRow('Status', 'Approved ✓')}
              ${infoRow('Payout', 'Processing shortly')}
            </table>
            ${para('Payment will be sent to you shortly. You can track the status on your dashboard.')}
            ${cta(`${URL}/draws`, 'View Status →', '#34d399', '#07060a')}
          `,
        }),
      })
    : send({
        to: email,
        subject: 'Action required — proof submission not approved',
        html: layout({
          preheader: 'Your proof was not approved. Please re-submit with a clear screenshot.',
          body: `
            ${badge('Resubmission Required', '#f87171', 'rgba(248,113,113,0.1)')}
            ${heading('Your proof needs to be re-submitted')}
            ${para(`Hi ${name || 'there'}, unfortunately our team was unable to verify your proof submission. This is usually because the screenshot wasn't clear enough or didn't show all the required information.`)}
            ${divider()}
            <div style="background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.2);border-radius:12px;padding:18px 20px;margin-bottom:24px;">
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5);font-weight:600;text-transform:uppercase;letter-spacing:0.07em;">Tips for resubmission</p>
              <p style="margin:8px 0 4px;font-size:14px;color:rgba(255,255,255,0.7);">• Use a full screenshot showing all 5 scores</p>
              <p style="margin:4px 0 4px;font-size:14px;color:rgba(255,255,255,0.7);">• Ensure dates are clearly visible</p>
              <p style="margin:4px 0 0;font-size:14px;color:rgba(255,255,255,0.7);">• Use a high-quality image (no blurring)</p>
            </div>
            ${para('Please re-submit your proof from the Draws page.')}
            ${cta(`${URL}/draws`, 'Re-submit Proof →', '#f87171', '#ffffff')}
          `,
        }),
      });
