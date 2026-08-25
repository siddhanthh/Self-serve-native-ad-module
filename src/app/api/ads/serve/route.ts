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
      SELECT c.id, c.company_name, c.title, c.description, c.image_url, c.destination_url, c.cta_text 
      FROM campaigns c
      LEFT JOIN campaign_finances cf ON c.id = cf.campaign_id
      WHERE c.approval_status = 'approved' 
        AND c.is_active = true 
        AND CURRENT_TIMESTAMP >= c.start_date 
        AND CURRENT_TIMESTAMP <= c.end_date
        AND (cf.spent_amount < cf.total_budget OR cf.campaign_id IS NULL)
      ORDER BY RANDOM() 
      LIMIT 5
    `);

    const formattedNativeAds = ads.map((ad) => ({
      id: `ad_campaign_${ad.id}`,
      isAd: true,
      authorName: ad.company_name !== 'N/A' ? ad.company_name : ad.title,
      advertiserLogo: "https://ui-avatars.com/api/?name=" + encodeURIComponent(ad.company_name || 'Ad') + "&background=random", 
      content: ad.description,
      images: [ad.image_url], 
      ctaText: ad.cta_text || "Learn More",  
      targetUrl: ad.destination_url,
      campaignId: ad.id       
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