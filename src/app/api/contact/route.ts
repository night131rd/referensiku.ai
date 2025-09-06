import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, category } = await request.json()

    // Validasi input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nama, email, dan pesan wajib diisi' },
        { status: 400 }
      )
    }

    // Buat Supabase client
    const supabase = createClient()

    // Simpan ke Supabase
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name,
          email,
          subject: subject || 'Pesan dari Contact Form',
          message,
          category: category || 'general'
        }
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Gagal menyimpan pesan' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Pesan berhasil dikirim!',
        data: data[0]
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
