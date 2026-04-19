"use client";
import { supabase } from "../../lib/supabase";
import {useState, useEffect} from "react";
import { useRouter } from "next/navigation";


const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F4F6FB; }
.page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; background: linear-gradient(160deg, #EBF1FF 0%, #F4F6FB 60%); }
.hero { background: linear-gradient(135deg, #0B1F5C, #1A6BFF); border-radius: 24px; padding: 32px 24px; text-align: center; width: 100%; max-width: 380px; margin-bottom: 20px; box-shadow: 0 8px 32px rgba(26,107,255,0.3); }
.hero-icon { font-size: 56px; margin-bottom: 10px; }
.hero-title { font-size: 26px; font-weight: 900; color: white; letter-spacing: -0.5px; }
.hero-sub { font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 6px; font-weight: 500; }
.card { background: white; border-radius: 20px; padding: 24px; width: 100%; max-width: 380px; border: 1.5px solid #E4EAFF; box-shadow: 0 4px 24px rgba(26,107,255,0.08); }
.lbl { font-size: 11px; font-weight: 700; color: #8A96B5; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block; }
.phone-row { display: flex; gap: 8px; margin-bottom: 16px; }
.phone-pre { background: #EBF1FF; border: 1.5px solid #E4EAFF; border-radius: 10px; padding: 12px 14px; font-size: 14px; font-weight: 700; color: #1A6BFF; flex-shrink: 0; }
.inp { flex: 1; padding: 12px 14px; border: 1.5px solid #E4EAFF; border-radius: 10px; font-size: 16px; font-weight: 600; color: #0D1B3E; font-family: inherit; outline: none; transition: border-color 0.2s; }
.inp:focus { border-color: #1A6BFF; }
.btn { width: 100%; padding: 14px; background: #1A6BFF; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 800; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.btn:hover:not(:disabled) { background: #1255CC; transform: translateY(-1px); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.info-box { background: #EBF1FF; border-radius: 12px; padding: 12px 14px; font-size: 12px; color: #1A6BFF; font-weight: 600; margin-bottom: 16px; line-height: 1.5; }
.welcome-box { background: #E6FAF4; border: 1.5px solid #B8E8D4; border-radius: 14px; padding: 16px; margin-bottom: 16px; text-align: center; }
.welcome-name { font-size: 20px; font-weight: 900; color: #0D1B3E; margin-bottom: 4px; }
.welcome-shop { font-size: 13px; color: #8A96B5; font-weight: 600; }
`;

export default function RiderLogin() {
  const router = useRouter();

  // Auto-redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) router.replace("/delivery");
    });
  }, []);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const fullPhone = "+91" + phone.replace(/\D/g, "");

  async function login() {
    if (phone.replace(/\D/g, "").length < 10) { alert("Enter valid 10-digit number"); return; }
    setLoading(true);
    // Check if registered as active rider
    const { data: riderData, error } = await supabase
      .from("riders")
      .select("id, name, shop_id, active, profiles!riders_shop_id_fkey(shop_name, name)")
      .eq("phone", fullPhone)
      .eq("active", true)
      .single();

    if (error || !riderData) {
      alert("This number is not registered as a rider.\nAsk your shopkeeper to add you first.");
      setLoading(false);
      return;
    }
    // Save to cookie (persists 30 days, survives browser/app close)
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = "bubbry_rider=" + encodeURIComponent(JSON.stringify(riderData)) + 
      "; expires=" + expires.toUTCString() + "; path=/; SameSite=Lax";
    // Also save to localStorage as backup
    localStorage.setItem("bubbry_rider", JSON.stringify(riderData));
    router.push("/delivery");
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{CSS}</style>
      <div className="page">
        <div className="hero">
          <div className="hero-icon">🛵</div>
          <div className="hero-title">Bubbry Rider</div>
          <div className="hero-sub">Delivery partner app</div>
        </div>
        <div className="card">
          <div className="info-box">
            📱 Enter the phone number your shopkeeper registered for you. No OTP needed.
          </div>
          <label className="lbl">Your Phone Number</label>
          <div className="phone-row">
            <div className="phone-pre">🇮🇳 +91</div>
            <input className="inp" type="tel" maxLength={10} placeholder="9876543210"
              value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
              onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          <button className="btn" onClick={login} disabled={loading || phone.length < 10}>
            {loading ? "Checking..." : "Login →"}
          </button>
        </div>
      </div>
    </div>
  );
}
