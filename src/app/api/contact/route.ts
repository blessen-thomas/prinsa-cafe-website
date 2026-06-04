import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const getFilePath = () => path.join(process.cwd(), 'data', 'messages.json');

async function getLocalData() {
  try {
    const fileContents = await fs.readFile(getFilePath(), 'utf8');
    return JSON.parse(fileContents);
  } catch (e) {
    return [];
  }
}

async function saveLocalData(data: any[]) {
  await fs.writeFile(getFilePath(), JSON.stringify(data, null, 2), 'utf8');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Name, email, and message are required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      const rawData = await getLocalData();
      const newId = Date.now().toString();

      const newMessage = {
        id: newId,
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
        is_read: false,
        createdAt: new Date().toISOString()
      };
      
      rawData.push(newMessage);
      await saveLocalData(rawData);

      return NextResponse.json({ success: true, message: "Thank you! We'll get back to you soon." });
    }

    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    const { error } = await supabase.from('contact_submissions').insert({
      name, email, phone: phone || null, subject: subject || null, message,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Thank you! We'll get back to you soon." });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit message' }, { status: 500 });
  }
}
