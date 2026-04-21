import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side route — uses service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { orderIds, handoffPhotoBase64, productPhotoBase64, riderId, orderId } = await req.json();

    if (!orderIds?.length || !orderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let handoffUrl = null;
    let productUrl = null;

    // Upload photos to storage using admin client (bypasses RLS)
    if (handoffPhotoBase64) {
      const buf = Buffer.from(handoffPhotoBase64, "base64");
      const path = `handoffs/${orderId}_customer.jpg`;
      const { error } = await supabaseAdmin.storage
        .from("product-images")
        .upload(path, buf, { upsert: true, contentType: "image/jpeg" });
      if (!error) {
        const { data } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
        handoffUrl = data.publicUrl;
      } else {
        console.error("Handoff upload error:", error.message);
      }
    }

    if (productPhotoBase64) {
      const buf = Buffer.from(productPhotoBase64, "base64");
      const path = `handoffs/${orderId}_products.jpg`;
      const { error } = await supabaseAdmin.storage
        .from("product-images")
        .upload(path, buf, { upsert: true, contentType: "image/jpeg" });
      if (!error) {
        const { data } = supabaseAdmin.storage.from("product-images").getPublicUrl(path);
        productUrl = data.publicUrl;
      } else {
        console.error("Product upload error:", error.message);
      }
    }

    // Update ALL order rows using admin client (bypasses RLS)
    const updateErrors = [];
    for (const id of orderIds) {
      const { error } = await supabaseAdmin
        .from("orders")
        .update({
          status: "completed",
          delivery_otp_verified: true,
          handoff_photo: handoffUrl,
          product_photo: productUrl,
          completed_at: new Date().toISOString(),
          rider_id: riderId || null,
        })
        .eq("id", id);
      if (error) updateErrors.push({ id, error: error.message });
    }

    if (updateErrors.length > 0) {
      console.error("Some order updates failed:", updateErrors);
    }

    return NextResponse.json({
      success: true,
      handoffUrl,
      productUrl,
      updateErrors,
    });
  } catch (e: any) {
    console.error("complete-order API error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
