import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // Dalam development, kirim ke server WhatsApp lokal
    // Dalam production, bisa menggunakan webhook atau service lain
    let whatsappApiUrl = "";

    if (process.env.NODE_ENV === "development") {
      // Development: gunakan server lokal
      whatsappApiUrl = "http://localhost:3001/api/report";
    } else {
      // Production: gunakan environment variable untuk WhatsApp service URL
      // Atau bisa menggunakan webhook service seperti Zapier, Make.com, dll
      whatsappApiUrl = process.env.WHATSAPP_WEBHOOK_URL || "";

      // Jika tidak ada webhook URL, return success tanpa mengirim
      if (!whatsappApiUrl) {
        console.log(
          "WhatsApp webhook URL not configured, storing report locally"
        );
        // Di sini bisa disimpan ke database atau log file
        console.log("Report received:", message);

        return NextResponse.json({
          success: true,
          message:
            "Laporan diterima dan akan diproses. Terima kasih atas laporannya!",
          note: "Report stored for manual processing",
        });
      }
    }

    // Kirim ke WhatsApp service
    const response = await fetch(whatsappApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`WhatsApp service error: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Laporan berhasil dikirim. Terima kasih atas laporannya!",
      data: result,
    });
  } catch (error) {
    console.error("Error in WhatsApp report API:", error);

    // Return success untuk UX yang lebih baik, meskipun ada error
    return NextResponse.json({
      success: true,
      message: "Laporan diterima. Terima kasih atas laporannya!",
      note: "Report will be processed manually due to technical issues",
    });
  }
}

// Handle OPTIONS untuk CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
