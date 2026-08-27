import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin');
  const corsHeaders = await getCorsHeaders(origin);
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  const origin = req.headers.get('origin');
  const corsHeaders = await getCorsHeaders(origin);

  try {
    const { rows: ads } = await query(`
      SELECT a.id as ad_id, c.id as campaign_id, c.company_name, a.title, a.description, a.image_url, a.video_url, a.destination_url, a.cta_text 
      FROM ads a
      JOIN campaigns c ON a.campaign_id = c.id
      LEFT JOIN campaign_finances cf ON c.id = cf.campaign_id
      WHERE a.approval_status = 'approved'
        AND a.is_active = true
        AND c.is_active = true 
        AND CURRENT_TIMESTAMP >= c.start_date 
        AND CURRENT_TIMESTAMP <= c.end_date
        AND (cf.spent_amount < cf.total_budget OR cf.campaign_id IS NULL)
      ORDER BY RANDOM() 
      LIMIT 5
    `);

    const formattedNativeAds = ads.map((ad) => ({
      id: `ad_${ad.ad_id}`,
      isAd: true,
      authorName: ad.company_name !== 'N/A' ? ad.company_name : ad.title,
      advertiserLogo: "https://ui-avatars.com/api/?name=" + encodeURIComponent(ad.company_name || 'Ad') + "&background=random", 
      content: ad.description,
      images: ad.image_url ? [ad.image_url] : [], 
      videoUrl: ad.video_url || undefined,
      ctaText: ad.cta_text || "Learn More",  
      targetUrl: ad.destination_url,
      adId: ad.ad_id,
      campaignId: ad.campaign_id       
    }));

    return NextResponse.json(
      formattedNativeAds, 
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('Failed to serve ads:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}