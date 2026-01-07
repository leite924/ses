import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SESClient, SendEmailCommand } from "npm:@aws-sdk/client-ses";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { from, to, subject, html, text, studio_id, campaign_id } = await req.json();

        // Basic Validation
        if (!studio_id || !to || !subject || !html) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields (studio_id, to, subject, html)' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Fetch SES settings for this studio from marketing_settings table
        const { data: settings, error: settingsError } = await supabase
            .from('marketing_settings')
            .select('key, value')
            .eq('studio_id', studio_id);

        if (settingsError || !settings || settings.length === 0) {
            throw new Error(`Could not fetch marketing settings for studio ${studio_id}`);
        }

        const awsRegion = settings.find(s => s.key === 'aws_region')?.value || 'us-east-1';
        const awsAccessKey = settings.find(s => s.key === 'aws_access_key_id')?.value;
        const awsSecretKey = settings.find(s => s.key === 'aws_secret_access_key')?.value;
        const defaultFrom = settings.find(s => s.key === 'from_email')?.value;

        if (!awsAccessKey || !awsSecretKey) {
            throw new Error('AWS credentials (access key or secret key) missing for this studio');
        }

        // Initialize SES Client with studio-specific credentials
        const sesClient = new SESClient({
            region: awsRegion,
            credentials: {
                accessKeyId: awsAccessKey,
                secretAccessKey: awsSecretKey,
            },
        });

        // Prepare Email Command
        const command = new SendEmailCommand({
            Destination: {
                ToAddresses: Array.isArray(to) ? to : [to],
            },
            Message: {
                Body: {
                    Html: { Data: html },
                    Text: { Data: text || '' },
                },
                Subject: { Data: subject },
            },
            Source: from || defaultFrom,
            // Custom headers for tracking via Webhook
            // SES supports custom headers if we use SendRawEmail, but for SendEmail 
            // we can use Configuration Sets and Message Tags if set up in AWS.
            // We'll also include these in the Message Tags.
        });

        // Add tracking tags if supported by the configuration set
        // Note: You must have a Configuration Set in SES to track these via SNS
        // If not using configuration sets, we'd need SendRawEmail for custom headers.
        (command.input as any).Tags = [
            { Name: 'studio-id', Value: studio_id },
            { Name: 'campaign-id', Value: campaign_id || 'none' }
        ];

        const response = await sesClient.send(command);

        return new Response(
            JSON.stringify({
                id: response.MessageId,
                message: 'Email sent successfully via Amazon SES'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Send email error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to send email', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
