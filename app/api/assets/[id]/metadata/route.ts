import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { UpdateAssetMetadataSchema } from '@/lib/types/sector';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: assetId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify asset ownership through portfolio
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select(`
        id,
        portfolios!inner (
          user_id
        )
      `)
      .eq('id', assetId)
      .single();

    if (assetError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Get metadata with sector joins
    const { data, error } = await supabase
      .from('asset_metadata')
      .select(`
        *,
        sector:sectors!asset_metadata_sector_id_fkey (*),
        manual_sector:sectors!asset_metadata_manual_sector_id_fkey (*)
      `)
      .eq('asset_id', assetId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No metadata exists, return empty with defaults
        return NextResponse.json({
          asset_id: assetId,
          sector_id: null,
          api_sector: null,
          manual_sector_id: null,
          manual_name: null,
          auto_category: null,
          manual_category: null,
          isin: null,
          exchange: null,
          country: null,
          is_default: true,
        });
      }
      console.error('Error fetching asset metadata:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ...data, is_default: false });
  } catch (error) {
    console.error('Error in GET /api/assets/[id]/metadata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id: assetId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify asset ownership through portfolio
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select(`
        id,
        portfolios!inner (
          user_id
        )
      `)
      .eq('id', assetId)
      .single();

    if (assetError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = UpdateAssetMetadataSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues }, { status: 400 });
    }

    // Upsert metadata
    const { data, error } = await supabase
      .from('asset_metadata')
      .upsert({
        asset_id: assetId,
        ...validated.data,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'asset_id',
      })
      .select(`
        *,
        sector:sectors!asset_metadata_sector_id_fkey (*),
        manual_sector:sectors!asset_metadata_manual_sector_id_fkey (*)
      `)
      .single();

    if (error) {
      console.error('Error updating asset metadata:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/assets/[id]/metadata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
