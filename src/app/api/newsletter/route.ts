import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validasi email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email tidak valid' },
        { status: 400 }
      )
    }

    // Buat Supabase client
    const supabase = createClient()

    // Cek apakah email sudah terdaftar
    const { data: existing } = await supabase
      .from('newsletter_subscriptions')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar di newsletter' },
        { status: 200 }
      )
    }

    // Simpan ke Supabase
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .insert([
        {
          email,
          is_active: true
        }
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Gagal mendaftar newsletter' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Berhasil mendaftar newsletter!',
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
