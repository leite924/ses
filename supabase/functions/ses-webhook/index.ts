import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const body = await req.json();

        // Handle SNS Subscription Confirmation
        if (body.Type === 'SubscriptionConfirmation') {
            console.log('SNS Subscription Confirmation received:', body.SubscribeURL);
            // In a real scenario, you might want to automatically visit the SubscribeURL
            // fetch(body.SubscribeURL);
            return new Response(JSON.stringify({ message: 'Confirmation received' }), { status: 200 });
        }

        // Handle SES Notifications
        if (body.Type === 'Notification') {
            const message = JSON.parse(body.Message);
            const { notificationType, mail } = message;

            // Extract metadata from mail headers if we sent it
            // We usually include 'x-campaign-id' or 'x-studio-id' in the headers
            const campaignId = mail.headers.find((h: any) => h.name.toLowerCase() === 'x-campaign-id')?.value;
            const studioId = mail.headers.find((h: any) => h.name.toLowerCase() === 'x-studio-id')?.value;

            if (notificationType === 'Bounce') {
                const { bounce } = message;
                for (const recipient of bounce.bouncedRecipients) {
                    // Update lead status
                    await supabase
                        .from('marketing_leads')
                        .update({ status: 'bounced' })
                        .eq('email', recipient.emailAddress)
                        .eq('studio_id', studioId);
                }

                if (campaignId) {
                    // Increment bounce count
                    await supabase.rpc('increment_campaign_metric', {
                        campaign_id: campaignId,
                        metric_column: 'bounced_count'
                    });
                }
            } else if (notificationType === 'Complaint') {
                const { complaint } = message;
                for (const recipient of complaint.complainedRecipients) {
                    await supabase
                        .from('marketing_leads')
                        .update({ status: 'unsubscribed' })
                        .eq('email', recipient.emailAddress)
                        .eq('studio_id', studioId);
                }

                if (campaignId) {
                    await supabase.rpc('increment_campaign_metric', {
                        campaign_id: campaignId,
                        metric_column: 'complaint_count'
                    });
                }
            } else if (notificationType === 'Delivery') {
                if (campaignId) {
                    await supabase.rpc('increment_campaign_metric', {
                        campaign_id: campaignId,
                        metric_column: 'delivered_count'
                    });
                }
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error('Webhook error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
