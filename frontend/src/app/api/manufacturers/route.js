import { currentUser } from "@clerk/nextjs/server"
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Create Supabase client inside the API route
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase
      .from('manufacturers')
      .select('*');

    if (error) {
      console.error('Supabase Query Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Route Handler Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      console.log('Auth failed on POST:', { user: !!user });
      return Response.json({ error: 'Unauthorized', details: 'No user found' }, { status: 401 });
    }

    const body = await request.json();

    // Check if manufacturer already exists
    const { data: existingManufacturer } = await supabase
      .from('manufacturers')
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (existingManufacturer) {
      return Response.json({ error: 'Manufacturer already exists' }, { status: 400 });
    }

    // Create new manufacturer
    const { data: manufacturer, error } = await supabase
      .from('manufacturers')
      .insert([{
        clerk_id: user.id,
        company_name: body.company_name || user.username,
        email: user.emailAddresses[0].emailAddress,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;

    return Response.json(manufacturer);
  } catch (error) {
    console.error('Manufacturers POST error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
} 