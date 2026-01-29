// Email service using Resend integration
import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

interface SafetyAlertEmailData {
  userId: string;
  userName?: string;
  timestamp: Date;
  energy: number;
  pain: number;
  confidence: number;
  safetyFlags: string[];
  sideEffects: string[];
  notes?: string;
  appUrl: string;
}

export async function sendSafetyAlertEmail(data: SafetyAlertEmailData): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const coachEmail = process.env.COACH_ALERT_EMAIL || 'davenowercise@gmail.com';
    
    const flagsList = data.safetyFlags.filter(f => f !== 'NONE_APPLY').join(', ');
    const sideEffectsList = data.sideEffects.filter(s => s !== 'NONE').join(', ');
    
    const emailBody = `
User: ${data.userName || data.userId}
Time: ${data.timestamp.toISOString()}
Energy/Pain/Confidence: ${data.energy}/${data.pain}/${data.confidence}

Safety flags: ${flagsList || 'None'}
Side effects: ${sideEffectsList || 'None'}
Notes: ${data.notes || 'None provided'}

Suggested action:
User selected a red-flag symptom. The app advised pausing exercise and checking with their healthcare team. Please follow up to ensure they're safe.

Link:
${data.appUrl}/coach/checkins?userId=${encodeURIComponent(data.userId)}
    `.trim();

    const result = await client.emails.send({
      from: fromEmail || 'Nowercise Alerts <alerts@nowercise.com>',
      to: coachEmail,
      subject: '[Nowercise] RED safety alert',
      text: emailBody,
    });

    console.log('Safety alert email sent:', result);
    return true;
  } catch (error) {
    console.error('Failed to send safety alert email:', error);
    return false;
  }
}
