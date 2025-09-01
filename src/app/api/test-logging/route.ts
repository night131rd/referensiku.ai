/**
 * Route untuk menguji pencatatan log pencarian
 */
import { logSearchQuery } from "@/lib/logging";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Lakukan pengujian log pencarian
    await logSearchQuery({
      query: "test query",
      year: null,
      mode: "test",
      status: "success"
    });
    
    return NextResponse.json({ message: "Logging successful" });
  } catch (error) {
    console.error("Test logging failed:", error);
    return NextResponse.json({ error: "Logging failed" }, { status: 500 });
  }
}
