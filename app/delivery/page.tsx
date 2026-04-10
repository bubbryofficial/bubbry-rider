"use client";
import { supabase } from "../../lib/supabase";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";


const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Plus Jakarta Sans', sans-serif; }
#rider-map { position: fixed; inset: 0; z-index: 1; }
.top-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: #0B1F5C; padding: 14px 16px; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
.rider-info { flex: 1; }
.rider-name { font-size: 15px; font-weight: 900; color: white; }
.shop-tag { font-size: 11px; color: rgba(255,255,255,0.6); font-weight: 600; }
.live-pill { background: #E53E3E; color: white; font-size: 10px; font-weight: 800; padding: 3px 9px; border-radius: 20px; display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.live-pill::before { content:''; width:6px; height:6px; border-radius:50%; background:white; animation:blink 1s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
.bottom-panel { position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; background: white; border-radius: 20px 20px 0 0; box-shadow: 0 -8px 32px rgba(0,0,0,0.15); max-height: 65vh; overflow-y: auto; }
.handle { width: 40px; height: 4px; background: #E4EAFF; border-radius: 2px; margin: 14px auto 10px; }
.queue-banner { background: #FFF8E6; border-radius: 10px; padding: 8px 12px; margin: 0 16px 10px; font-size: 12px; font-weight: 700; color: #946200; }
.slides-wrap { display: flex; gap: 10px; overflow-x: auto; padding: 0 16px 8px; scrollbar-width: none; scroll-snap-type: x mandatory; }
.slides-wrap::-webkit-scrollbar { display: none; }
.slide { flex-shrink: 0; width: calc(100vw - 48px); max-width: 440px; background: #F4F6FB; border-radius: 14px; padding: 14px; border: 2px solid #E4EAFF; scroll-snap-align: start; cursor: pointer; transition: border-color 0.2s; }
.slide.active { border-color: #1A6BFF; background: #EBF1FF; }
.slide-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.slide-num { font-size: 11px; font-weight: 800; color: #8A96B5; text-transform: uppercase; }
.chip-active { font-size: 10px; font-weight: 800; background: #1A6BFF; color: white; padding: 3px 8px; border-radius: 6px; }
.chip-queue { font-size: 10px; font-weight: 800; background: #F4F6FB; color: #8A96B5; border: 1.5px solid #E4EAFF; padding: 3px 8px; border-radius: 6px; }
.dots { display: flex; justify-content: center; gap: 6px; padding: 6px 0; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: #D0D8EF; cursor: pointer; transition: all 0.2s; }
.dot.on { background: #1A6BFF; width: 18px; border-radius: 3px; }
.pay-row { display: flex; gap: 8px; margin: 6px 0 8px; }
.pay-box { flex: 1; border-radius: 8px; padding: 6px 10px; }
.upi { background: #E6FAF4; }
.cash { background: #FFF8E6; }
.pv-g { font-size: 14px; font-weight: 900; color: #00875A; }
.pv-o { font-size: 14px; font-weight: 900; color: #946200; }
.pl { font-size: 10px; color: #8A96B5; font-weight: 700; margin-top: 1px; }
.deliver-btn { width: 100%; padding: 15px; background: #00B37E; color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 800; cursor: pointer; font-family: inherit; }
.deliver-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.logout-btn { width: 100%; padding: 12px; background: none; border: 1.5px solid #E4EAFF; border-radius: 12px; font-size: 14px; font-weight: 700; color: #8A96B5; cursor: pointer; font-family: inherit; margin-top: 8px; }
.call-customer-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 11px; background: #E6FAF4; border: 1.5px solid #B8E8D4; border-radius: 12px; font-size: 14px; font-weight: 800; color: #00875A; text-decoration: none; margin-top: 8px; font-family: inherit; }
.no-order { text-align: center; padding: 32px 16px; }
.fit-btn { position: fixed; bottom: 280px; right: 16px; z-index: 100; width: 46px; height: 46px; background: white; border-radius: 50%; border: none; font-size: 18px; box-shadow: 0 4px 14px rgba(0,0,0,0.15); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.modal-bg { position: fixed; inset: 0; background: rgba(13,27,62,0.6); z-index: 2000; display: flex; align-items: flex-end; justify-content: center; backdrop-filter: blur(4px); }
.modal { background: white; border-radius: 24px 24px 0 0; width: 100%; max-width: 480px; max-height: 92vh; overflow-y: auto; }
.m-handle { width: 40px; height: 4px; background: #E4EAFF; border-radius: 2px; margin: 14px auto 16px; }
.m-title { font-size: 18px; font-weight: 900; color: #0D1B3E; padding: 0 20px 6px; }
.m-sub { font-size: 13px; color: #8A96B5; padding: 0 20px 16px; }
.progress { display: flex; margin: 0 20px 20px; }
.ps { flex: 1; text-align: center; font-size: 10px; font-weight: 800; color: #B0BACC; padding-bottom: 8px; border-bottom: 3px solid #E4EAFF; }
.ps.active { color: #1A6BFF; border-color: #1A6BFF; }
.ps.done { color: #00B37E; border-color: #00B37E; }
.m-body { padding: 0 20px 16px; }
.otp-in { width: 100%; padding: 16px; border: 2.5px solid #E4EAFF; border-radius: 14px; font-size: 28px; font-weight: 900; color: #0D1B3E; font-family: inherit; outline: none; text-align: center; letter-spacing: 8px; margin-bottom: 10px; box-sizing: border-box; }
.otp-in:focus { border-color: #1A6BFF; }
.otp-btn { width: 100%; padding: 13px; background: #1A6BFF; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 800; cursor: pointer; font-family: inherit; margin-bottom: 10px; }
.otp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ok-box { background: #E6FAF4; border: 1.5px solid #B8E8D4; border-radius: 12px; padding: 12px 14px; font-size: 13px; font-weight: 800; color: #00875A; margin-bottom: 14px; }
.cam-box { border: 2px dashed #E4EAFF; border-radius: 14px; overflow: hidden; cursor: pointer; margin-bottom: 10px; background: #F4F6FB; }
.cam-box.got { border: 2px solid #00B37E; }
.cam-inner { padding: 24px 16px; text-align: center; }
.cam-emo { font-size: 36px; margin-bottom: 8px; }
.cam-t { font-size: 14px; font-weight: 800; color: #0D1B3E; }
.cam-r { color: #E53E3E; font-weight: 700; font-size: 10px; margin-top: 3px; }
.prev-img { width: 100%; height: 160px; object-fit: cover; display: block; }
.live-tag { position: absolute; top: 8px; left: 8px; background: #E53E3E; color: white; font-size: 9px; font-weight: 800; padding: 3px 7px; border-radius: 5px; }
.retake-bar { display: flex; justify-content: center; padding: 8px; background: rgba(0,0,0,0.05); }
.retake-btn { padding: 6px 16px; background: white; border: 1.5px solid #E4EAFF; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; }
.confirm-btn { width: calc(100% - 40px); margin: 0 20px 32px; padding: 15px; background: #00B37E; color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 800; cursor: pointer; font-family: inherit; display: block; }
.confirm-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.cam-overlay { position: fixed; inset: 0; background: black; z-index: 9999; }
.cam-lbl { position: absolute; top: 0; left: 0; right: 0; z-index: 10; color: white; font-size: 13px; font-weight: 700; text-align: center; padding: 14px 16px; padding-top: max(14px, env(safe-area-inset-top)); background: linear-gradient(to bottom, rgba(0,0,0,0.75), transparent); }
.cam-vid-wrap { position: absolute; inset: 0; overflow: hidden; }
.cam-vid { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.cam-corner { position: absolute; width: 40px; height: 40px; border-color: white; border-style: solid; opacity: 0.6; }
.cam-corner.tl { top: 16px; left: 16px; border-width: 3px 0 0 3px; }
.cam-corner.tr { top: 16px; right: 16px; border-width: 3px 3px 0 0; }
.cam-corner.bl { bottom: 16px; left: 16px; border-width: 0 0 3px 3px; }
.cam-corner.br { bottom: 16px; right: 16px; border-width: 0 3px 3px 0; }
.cam-ctrl { position: absolute; bottom: 0; left: 0; right: 0; z-index: 10; background: linear-gradient(to top, rgba(0,0,0,0.85), transparent); padding: 32px 40px; padding-bottom: max(32px, env(safe-area-inset-bottom)); display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.shutter-wrap { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.shutter { width: 80px; height: 80px; border-radius: 50%; background: white; border: 5px solid rgba(255,255,255,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 3px rgba(255,255,255,0.2); flex-shrink: 0; }
.shutter:active { transform: scale(0.93); }
.shutter-label { color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 700; }
.cam-btn { width: 54px; height: 54px; border-radius: 50%; background: rgba(255,255,255,0.18); border: none; color: white; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cam-btn:active { background: rgba(255,255,255,0.3); }
.cam-btn.close { background: rgba(220,50,50,0.4); }
`;

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000, r = (d: number) => d * Math.PI / 180;
  const a = Math.sin(r(lat2-lat1)/2)**2 + Math.cos(r(lat1))*Math.cos(r(lat2))*Math.sin(r(lng2-lng1)/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

export default function RiderDelivery() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const riderMkr = useRef<any>(null);
  const shopMkr = useRef<any>(null);
  const custMkrs = useRef<any[]>([]);
  const routeLine = useRef<any>(null);
  const lastRouteOriginRef = useRef<{lat:number,lng:number}|null>(null);
  const activeOrderRef = useRef<any>(null);
  const ordersRef = useRef<any[]>([]);       // always-current orders for GPS callback
  const activeIdxRef = useRef<number>(0);    // always-current activeIdx for GPS callback
  const firstPosFix = useRef<boolean>(false); // whether we've centred on rider yet
  const gpsWatch = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const camStream = useRef<MediaStream|null>(null);

  const [rider, setRider] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [myPos, setMyPos] = useState<{lat:number,lng:number}|null>(null);
  const [dist, setDist] = useState<number|null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [shopData, setShopData] = useState<any>(null);
  const idleChannelRef = useRef<any>(null);
  const [gpsErr, setGpsErr] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<"otp"|"photos"|"confirm">("otp");
  const [otp, setOtp] = useState(""); const [otpOk, setOtpOk] = useState(false);
  const [pFile, setPFile] = useState<File|null>(null); const [pPrev, setPPrev] = useState("");
  const [cFile, setCFile] = useState<File|null>(null); const [cPrev, setCPrev] = useState("");
  const [camOpen, setCamOpen] = useState<"p"|"c"|null>(null);
  const [camFace, setCamFace] = useState<"environment"|"user">("environment");
  const [saving, setSaving] = useState(false);

  const order = orders[activeIdx] || null;

  useEffect(() => {
    const saved = localStorage.getItem("bubbry_rider");
    if (!saved) { router.replace("/login"); return; }
    const r = JSON.parse(saved);
    setRider(r);
    loadLeaflet(r);
    return () => {
      if (gpsWatch.current != null) navigator.geolocation.clearWatch(gpsWatch.current);
      camStream.current?.getTracks().forEach(t => t.stop());
      try { mapRef.current?.remove(); } catch {}
    };
  }, []);

  useEffect(() => {
    const ao = orders[activeIdx];
    if (ao) activeOrderRef.current = ao;
    ordersRef.current = orders;
    activeIdxRef.current = activeIdx;
    if (mapReady && orders.length > 0) drawMarkers();
  }, [mapReady, activeIdx, orders.length]);

  // Update rider marker + route whenever position changes
  useEffect(() => {
    if (!myPos || !mapRef.current) return;
    const L = (window as any).L; if (!L) return;
    // Update rider marker
    if (riderMkr.current) riderMkr.current.setLatLng([myPos.lat, myPos.lng]);
    else {
      const ic = L.divIcon({ html:`<div style="font-size:30px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.3))">🛵</div>`,iconSize:[32,32],iconAnchor:[16,32],className:"" });
      riderMkr.current = L.marker([myPos.lat,myPos.lng],{icon:ic,zIndexOffset:2000}).addTo(mapRef.current).bindPopup("🛵 You");
    }
    // Prefer activeOrderRef — but fall back to ordersRef so route appears even on first GPS fix
    const activeOrd = activeOrderRef.current || (ordersRef.current?.[activeIdxRef.current] ?? null);
    if (activeOrd?.delivery_lat && activeOrd?.delivery_lng) {
      // Active delivery — route rider to customer destination
      setDist(haversine(myPos.lat,myPos.lng,activeOrd.delivery_lat,activeOrd.delivery_lng));
      drawRoute(myPos.lat,myPos.lng,activeOrd.delivery_lat,activeOrd.delivery_lng);
    } else if (ordersRef.current?.length === 0) {
      // Truly idle (no orders at all) — route to shop so rider knows how to get there
      setShopData((sh: any) => {
        if (sh?.latitude && sh?.longitude) {
          drawRoute(myPos.lat, myPos.lng, sh.latitude, sh.longitude);
          setDist(haversine(myPos.lat,myPos.lng,sh.latitude,sh.longitude));
        }
        return sh;
      });
    }
    // First GPS fix: centre rider in the VISIBLE map area above the bottom panel
    if (!firstPosFix.current) {
      firstPosFix.current = true;
      mapRef.current.setView([myPos.lat, myPos.lng], 16);
      // Bottom panel is up to 65vh — shift map up so rider shows in middle of visible area
      setTimeout(() => {
        if (!mapRef.current) return;
        try {
          const mapH = mapRef.current.getSize().y;
          const panelH = Math.min(window.innerHeight * 0.65, 380); // approx panel height
          const visibleH = mapH - panelH;
          // Pan up by half the panel height so rider is centred in visible portion
          mapRef.current.panBy([0, -(panelH / 2)], { animate: false });
        } catch {}
      }, 50);
    } else {
      fitMapToRelevant();
    }
  }, [myPos]);

  function fitMapToRelevant() {
    const L = (window as any).L;
    if (!L || !mapRef.current || !myPos) return;
    const pts: number[][] = [[myPos.lat, myPos.lng]];
    const activeOrd = activeOrderRef.current;
    if (activeOrd?.delivery_lat && activeOrd?.delivery_lng) {
      pts.push([activeOrd.delivery_lat, activeOrd.delivery_lng]);
    } else if (shopData?.latitude && shopData?.longitude) {
      pts.push([shopData.latitude, shopData.longitude]);
    }
    // Pad bottom for the panel (~65vh) so markers aren't hidden under it
    const panelH = Math.min(window.innerHeight * 0.65, 380);
    if (pts.length >= 2) {
      try { mapRef.current.fitBounds(pts, { paddingTopLeft:[60,80], paddingBottomRight:[60, panelH] }); } catch {}
    }
  }

  // Redraw route + fit map when active order changes
  useEffect(() => {
    const activeOrd = orders[activeIdx];
    if (!activeOrd) return;
    activeOrderRef.current = activeOrd;
    setDist(null);
    if (myPos && activeOrd.delivery_lat && activeOrd.delivery_lng) {
      setDist(haversine(myPos.lat,myPos.lng,activeOrd.delivery_lat,activeOrd.delivery_lng));
      drawRoute(myPos.lat,myPos.lng,activeOrd.delivery_lat,activeOrd.delivery_lng);
    }
    // Fit map to show rider + active destination
    if (mapRef.current) {
      const pts: number[][] = [];
      if (myPos) pts.push([myPos.lat,myPos.lng]);
      if (activeOrd.delivery_lat && activeOrd.delivery_lng) pts.push([activeOrd.delivery_lat,activeOrd.delivery_lng]);
      if (pts.length === 2) { try { mapRef.current.fitBounds(pts,{padding:[80,80]}); } catch {} }
      else if (pts.length === 1) mapRef.current.setView(pts[0], 16);
      else if (activeOrd.delivery_lat) mapRef.current.setView([activeOrd.delivery_lat,activeOrd.delivery_lng],15);
    }
  }, [activeIdx, orders]);

  function loadLeaflet(r: any) {
    const link = document.createElement("link"); link.rel="stylesheet"; link.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(link);
    const s = document.createElement("script"); s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload = async () => {
      const L = (window as any).L;
      const map = L.map("rider-map",{zoomControl:true}).setView([29.2183,79.5130],14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OSM",maxZoom:19}).addTo(map);
      mapRef.current = map; setMapReady(true);
      // Load shop location immediately
      try {
        const {data:sh} = await supabase.from("profiles").select("id,shop_name,name,latitude,longitude").eq("id",r.shop_id).single();
        if (sh) {
          setShopData(sh);
          if (sh.latitude && sh.longitude) {
            const ic = L.divIcon({html:`<div style="font-size:30px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.3))">🏪</div>`,iconSize:[32,32],iconAnchor:[16,32],className:""});
            shopMkr.current = L.marker([sh.latitude,sh.longitude],{icon:ic}).addTo(map).bindPopup(`🏪 ${sh.shop_name||sh.name}`);
            map.setView([sh.latitude,sh.longitude],15);
          }
        }
      } catch(e) { console.error("shop load",e); }
      // Start GPS immediately — broadcast to idle channel so shop can see rider even without order
      startIdleGPS(r);
      await fetchOrders(r);
      subscribeNewOrders(r);
    };
    document.head.appendChild(s);
  }

  async function fetchOrders(r: any) {
    try {
      const { data } = await supabase.from("orders")
        .select("id,group_id,status,order_type,delivery_address,delivery_instructions,delivery_lat,delivery_lng,shop_id,rider_id,amount_paid,amount_cash,payment_method,delivery_otp,delivery_otp_verified,customer_id")
        .eq("rider_id", r.id).eq("status","out_for_delivery").order("created_at",{ascending:true});
      if (!data || data.length === 0) return;
      const seen = new Set<string>(); const list: any[] = [];
      for (const o of data) {
        const key = o.group_id || o.id; if (seen.has(key)) continue; seen.add(key);
        if (o.group_id) { const {data:gr} = await supabase.from("orders").select("id").eq("group_id",o.group_id).eq("status","out_for_delivery"); o.all_ids=(gr||[]).map((x:any)=>x.id); }
        else o.all_ids=[o.id];
        list.push(o);
      }
      // Fetch customer phones
      const custIds = [...new Set(list.map((o:any) => o.customer_id).filter(Boolean))];
      if (custIds.length > 0) {
        const {data: custData} = await supabase.from("profiles").select("id,phone,name").in("id", custIds);
        const custMap: any = {};
        (custData||[]).forEach((c:any) => { custMap[c.id] = {phone: c.phone, name: c.name}; });
        list.forEach((o:any) => {
          o.customer_phone = o.customer_id ? custMap[o.customer_id]?.phone || null : null;
          o.customer_name = o.customer_id ? custMap[o.customer_id]?.name || null : null;
        });
      }
      ordersRef.current = list; activeIdxRef.current = 0;
      setOrders(list); setActiveIdx(0);
      if (list.length > 0) startGPS(list[0].id);
    } catch(e) { console.error("fetchOrders",e); }
  }

  function subscribeNewOrders(r: any) {
    supabase.channel(`rider-assign-${r.id}`)
      .on("broadcast",{event:"assigned"}, async (payload:any) => {
        const id = payload.payload?.order?.id; if (!id) return;
        const {data:full} = await supabase.from("orders").select("id,group_id,status,order_type,delivery_address,delivery_instructions,delivery_lat,delivery_lng,shop_id,rider_id,amount_paid,amount_cash,payment_method,delivery_otp,delivery_otp_verified,customer_id").eq("id",id).single();
        if (!full) return;
        if (full.group_id) { const {data:gr} = await supabase.from("orders").select("id").eq("group_id",full.group_id); (full as any).all_ids=(gr||[]).map((x:any)=>x.id); }
        else (full as any).all_ids=[full.id];
        // Deduplicate by group_id as well as id
        const groupKey = (full as any).group_id || full.id;
        setOrders(prev => prev.find((o:any) => o.id===full.id || (o.group_id && o.group_id===groupKey)) ? prev : [...prev, full]);
        startGPS(full.id);
      }).subscribe();

    supabase.channel(`rider-db-${r.id}`)
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"orders"}, async (payload:any) => {
        const n = payload.new;
        if (n?.rider_id !== r.id) return;

        // Remove from list when order is completed or cancelled
        if (n?.status === "completed" || n?.status === "cancelled") {
          setOrders(prev => {
            const updated = prev.filter((o:any) => o.id !== n.id && !(o.group_id && o.group_id === n.group_id));
            ordersRef.current = updated;
            return updated;
          });
          return;
        }

        // Add when newly assigned (out_for_delivery)
        if (n?.status !== "out_for_delivery") return;
        if (n.group_id) { const {data:gr} = await supabase.from("orders").select("id").eq("group_id",n.group_id); n.all_ids=(gr||[]).map((x:any)=>x.id); }
        else n.all_ids=[n.id];
        // Deduplicate by group_id — prevents adding same group multiple times when multiple rows update
        const gKey = n.group_id || n.id;
        setOrders(prev => {
          if (prev.find((o:any) => o.id===n.id || (o.group_id && o.group_id===gKey))) return prev;
          const updated = [...prev, n];
          ordersRef.current = updated;
          return updated;
        });
        startGPS(n.id);
      }).subscribe();
  }

  function startIdleGPS(r: any) {
    // Always-on GPS — broadcasts to shop even without an order
    if (!navigator.geolocation) { setGpsErr("GPS not supported"); return; }
    const ch = supabase.channel(`rider-idle-${r.id}`)
      .on("broadcast",{event:"pos"},()=>{})
      .subscribe((st:string) => {
        if (st==="SUBSCRIBED") {
          idleChannelRef.current = ch;
          if (gpsWatch.current != null) return; // already watching
          gpsWatch.current = navigator.geolocation.watchPosition(
            pos => {
              const {latitude:lat,longitude:lng} = pos.coords;
              setGpsErr(""); setMyPos({lat,lng});
              ch.send({type:"broadcast",event:"pos",payload:{lat,lng}});
              // Also broadcast to active order channel if exists
              const ao = activeOrderRef.current;
              if (ao?.id) {
                supabase.channel(`rider-${ao.id}`).send({type:"broadcast",event:"pos",payload:{lat,lng}}).catch(()=>{});
              }
              // Persist GPS to DB on every fix — customer track page polls this
              if (r?.id) {
                // Write to riders table (requires last_lat, last_lng columns)
                supabase.from("riders").update({ last_lat: lat, last_lng: lng }).eq("id", r.id).then(() => {}).catch(() => {});
                // Also write to active order rows as rider_lat/rider_lng (fallback — always works)
                const ao2 = activeOrderRef.current;
                if (ao2?.all_ids?.length) {
                  for (const oid of ao2.all_ids) {
                    supabase.from("orders").update({ rider_lat: lat, rider_lng: lng }).eq("id", oid).then(()=>{}).catch(()=>{});
                  }
                } else if (ao2?.id) {
                  supabase.from("orders").update({ rider_lat: lat, rider_lng: lng }).eq("id", ao2.id).then(()=>{}).catch(()=>{});
                }
              }
            },
            err => setGpsErr(err.code===1?"Location permission denied":"GPS error"),
            {enableHighAccuracy:true,maximumAge:2000,timeout:12000}
          );
        }
      });
  }

  function startGPS(orderId: string) {
    // Just ensures the order-specific channel exists — GPS already running from startIdleGPS
    if (!gpsWatch.current && navigator.geolocation) {
      // GPS not started yet (shouldn't happen but fallback)
      gpsWatch.current = navigator.geolocation.watchPosition(
        pos => { const {latitude:lat,longitude:lng}=pos.coords; setGpsErr(""); setMyPos({lat,lng}); },
        err => setGpsErr(err.code===1?"Location permission denied":"GPS error"),
        {enableHighAccuracy:true,maximumAge:2000,timeout:12000}
      );
    }
  }

  async function drawMarkers() {
    const L=(window as any).L; if (!L||!mapRef.current||orders.length===0) return;
    if (shopMkr.current) { try{shopMkr.current.remove();}catch{} shopMkr.current=null; }
    custMkrs.current.forEach(m=>{try{m.remove();}catch{}}); custMkrs.current=[];
    if (routeLine.current) { try{routeLine.current.remove();}catch{} routeLine.current=null; }
    const ao = orders[activeIdx]; const bounds:number[][]=[];
    try {
      const {data:sh} = await supabase.from("profiles").select("shop_name,name,latitude,longitude").eq("id",ao.shop_id).single();
      if (sh?.latitude&&sh?.longitude) {
        const ic=L.divIcon({html:`<div style="font-size:30px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.3))">🏪</div>`,iconSize:[32,32],iconAnchor:[16,32],className:""});
        shopMkr.current=L.marker([sh.latitude,sh.longitude],{icon:ic}).addTo(mapRef.current).bindPopup(`🏪 ${sh.shop_name||sh.name}`);
        bounds.push([sh.latitude,sh.longitude]);
      }
    } catch{}
    for (let i=0;i<orders.length;i++) {
      const o=orders[i]; if (!o.delivery_lat||!o.delivery_lng) continue;
      const isA=i===activeIdx;
      const ic=L.divIcon({html:`<div style="font-size:${isA?34:22}px;opacity:${isA?1:0.55};filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${isA?"📍":"🔵"}</div>`,iconSize:[isA?36:24,isA?36:24],iconAnchor:[isA?18:12,isA?36:24],className:""});
      const m=L.marker([o.delivery_lat,o.delivery_lng],{icon:ic}).addTo(mapRef.current).bindPopup(`<b>${isA?"📍 Active":"🔵 Order "+(i+1)}</b><br>${o.delivery_instructions||o.delivery_address||""}`);
      if (isA) m.openPopup();
      custMkrs.current.push(m); bounds.push([o.delivery_lat,o.delivery_lng]);
    }
    if (bounds.length>1) { try{mapRef.current.fitBounds(bounds,{padding:[80,80]});}catch{} }
    else if (ao?.delivery_lat) mapRef.current.setView([ao.delivery_lat,ao.delivery_lng],15);
  }

  async function drawRoute(rLat:number,rLng:number,dLat:number,dLng:number) {
    const L=(window as any).L; if (!L||!mapRef.current) return;
    // Only redraw if rider moved >30m — prevents blinking on every GPS update
    const last = lastRouteOriginRef.current;
    if (last && haversine(last.lat,last.lng,rLat,rLng) < 30) return;
    lastRouteOriginRef.current = {lat:rLat,lng:rLng};
    const drawNew = (layer:any) => {
      if (routeLine.current) { try{routeLine.current.remove();}catch{} routeLine.current=null; }
      routeLine.current = layer;
      layer.addTo(mapRef.current);
    };
    try {
      const res=await fetch(`https://router.project-osrm.org/route/v1/driving/${rLng},${rLat};${dLng},${dLat}?overview=full&geometries=geojson`);
      const d=await res.json();
      if (d.code==="Ok"&&d.routes?.[0]?.geometry) { drawNew(L.geoJSON(d.routes[0].geometry,{style:{color:"#1A6BFF",weight:5,opacity:0.9}})); return; }
    } catch{}
    drawNew(L.polyline([[rLat,rLng],[dLat,dLng]],{color:"#1A6BFF",weight:4,opacity:0.7,dashArray:"8,6"}));
  }

  function fitAll() {
    const L=(window as any).L; if (!L||!mapRef.current) return;
    const pts:number[][]=[];
    if (myPos) pts.push([myPos.lat,myPos.lng]);
    orders.forEach(o=>{if(o.delivery_lat&&o.delivery_lng)pts.push([o.delivery_lat,o.delivery_lng]);});
    if (pts.length>=2) { try{mapRef.current.fitBounds(pts,{padding:[80,80]});}catch{} }
    else if (pts.length===1) mapRef.current.setView(pts[0],16);
  }

  async function openCam(type:"p"|"c") {
    setCamOpen(type); setCamFace("environment");
    try {
      const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
      camStream.current=s; setTimeout(()=>{if(videoRef.current){videoRef.current.srcObject=s;videoRef.current.play();}},100);
    } catch { alert("Camera access denied."); setCamOpen(null); }
  }
  function stopCam() { camStream.current?.getTracks().forEach(t=>t.stop()); camStream.current=null; setCamOpen(null); }
  async function flipCam() {
    const nf=camFace==="environment"?"user":"environment"; setCamFace(nf);
    camStream.current?.getTracks().forEach(t=>t.stop());
    const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:nf}},audio:false});
    camStream.current=s; if(videoRef.current){videoRef.current.srcObject=s;videoRef.current.play();}
  }
  function snap() {
    if (!videoRef.current||!canvasRef.current||!camOpen) return;
    const v=videoRef.current,cv=canvasRef.current; cv.width=v.videoWidth||1280;cv.height=v.videoHeight||720;
    cv.getContext("2d")?.drawImage(v,0,0,cv.width,cv.height);
    cv.toBlob(blob=>{
      if (!blob) return;
      const file=new File([blob],`photo_${Date.now()}.jpg`,{type:"image/jpeg"});
      const url=URL.createObjectURL(blob);
      if (camOpen==="p"){setPFile(file);setPPrev(url);}else{setCFile(file);setCPrev(url);}
      stopCam();
    },"image/jpeg",0.92);
  }

  function checkOtp() {
    if (otp.trim()===order?.delivery_otp){setOtpOk(true);setStep("photos");}
    else alert("❌ Wrong OTP. Ask the customer for the correct code.");
  }

  async function submit() {
    if (!order||!pFile||!cFile) return;
    setSaving(true);
    try {
      const base=`handoffs/${order.id}`;
      let pUrl=null,cUrl=null;
      const {error:pe}=await supabase.storage.from("product-images").upload(`${base}_products.jpg`,pFile,{upsert:true,contentType:"image/jpeg"});
      if (!pe){const{data}=supabase.storage.from("product-images").getPublicUrl(`${base}_products.jpg`);pUrl=data.publicUrl;}
      const {error:ce}=await supabase.storage.from("product-images").upload(`${base}_customer.jpg`,cFile,{upsert:true,contentType:"image/jpeg"});
      if (!ce){const{data}=supabase.storage.from("product-images").getPublicUrl(`${base}_customer.jpg`);cUrl=data.publicUrl;}
      for (const id of (order.all_ids||[order.id])) {
        await supabase.from("orders").update({status:"completed",delivery_otp_verified:true,handoff_photo:cUrl,product_photo:pUrl,completed_at:new Date().toISOString(),rider_id:rider?.id}).eq("id",id);
        // Stock already deducted when shopkeeper marked order ready
      }
      const cid=order.id;
      setOrders(prev=>{
        const rem=prev.filter(o=>o.id!==cid);
        setActiveIdx(0);
        if (rem.length===0) {
          [shopMkr,riderMkr].forEach(r=>{if(r.current){try{r.current.remove();}catch{}r.current=null;}});
          custMkrs.current.forEach(m=>{try{m.remove();}catch{}}); custMkrs.current=[];
          if(routeLine.current){try{routeLine.current.remove();}catch{}routeLine.current=null;}
          if(gpsWatch.current!=null){navigator.geolocation.clearWatch(gpsWatch.current);gpsWatch.current=null;}
          setMyPos(null);setDist(null);
          try{mapRef.current?.setView([29.2183,79.5130],14);}catch{}
        }
        return rem;
      });
      setShowModal(false); setDist(null); setSaving(false);
      const rem=orders.length-1;
      alert(rem>0?`✅ Delivered! ${rem} more order${rem>1?"s":""} to go.`:"✅ Delivered! Waiting for next assignment.");
    } catch(e:any){alert("Error: "+e.message);setSaving(false);}
  }

  function logout(){localStorage.removeItem("bubbry_rider");supabase.auth.signOut();router.replace("/login");}

  function openDeliverModal(){setShowModal(true);setStep("otp");setOtp("");setOtpOk(false);setPFile(null);setPPrev("");setCFile(null);setCPrev("");}

  return (
    <div style={{height:"100vh",overflow:"hidden",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{CSS}</style>
      <div id="rider-map"/>
      <canvas ref={canvasRef} style={{display:"none"}}/>
      <div className="top-bar">
        <div className="rider-info">
          <div className="rider-name">🛵 {rider?.name||"Rider"}</div>
          <div className="shop-tag">{(rider?.profiles as any)?.shop_name||"Loading..."}</div>
        </div>
        {myPos&&!gpsErr&&<div className="live-pill">GPS LIVE</div>}
      </div>
      <button className="fit-btn" onClick={fitAll}>🗺️</button>
      <div className="bottom-panel">
        <div className="handle"/>
        {orders.length>0?(
          <>
            {orders.length>1&&<div className="queue-banner">📦 {orders.length} orders — swipe to see all, tap to select which to deliver first</div>}
            <div className="slides-wrap">
              {orders.map((o:any,i:number)=>(
                <div key={o.id} className={`slide ${i===activeIdx?"active":""}`} onClick={()=>{setActiveIdx(i);setDist(null);}}>
                  <div className="slide-hdr">
                    <div className="slide-num">Order {i+1}/{orders.length} · #{o.id.slice(0,6).toUpperCase()}</div>
                    {i===activeIdx?<div className="chip-active">🛵 Active</div>:<div className="chip-queue">⏳ Queued</div>}
                  </div>
                  <div style={{fontSize:14,fontWeight:800,color:"#0D1B3E",lineHeight:1.4,marginBottom:3}}>
                    {o.delivery_instructions||o.delivery_address?.split(",").slice(0,2).join(",")}
                  </div>
                  {o.delivery_instructions&&<div style={{fontSize:11,color:"#8A96B5",fontWeight:500,marginBottom:6}}>{o.delivery_address}</div>}
                  <div className="pay-row">
                    {o.amount_paid>0&&<div className="pay-box upi"><div className="pv-g">₹{o.amount_paid}</div><div className="pl">UPI Paid</div></div>}
                    {o.amount_cash>0&&<div className="pay-box cash"><div className="pv-o">₹{o.amount_cash}</div><div className="pl">Collect Cash</div></div>}
                  </div>
                  {i===activeIdx&&dist!==null&&<div style={{fontSize:12,fontWeight:800,color:"#1A6BFF",background:"white",borderRadius:8,padding:"5px 10px",display:"inline-block"}}>📍 {dist<1000?`${dist}m`:`${(dist/1000).toFixed(1)}km`} away</div>}
                </div>
              ))}
            </div>
            {orders.length>1&&<div className="dots">{orders.map((_:any,i:number)=><div key={i} className={`dot ${i===activeIdx?"on":""}`} onClick={()=>setActiveIdx(i)}/>)}</div>}
            <div style={{padding:"6px 16px",fontSize:12,fontWeight:700,color:gpsErr?"#E53E3E":"#00875A"}}>
              {gpsErr?`⚠️ ${gpsErr}`:myPos?"📡 Broadcasting live":"🔄 Getting GPS..."}
            </div>
            <div style={{padding:"0 16px 8px"}}>
              <button className="deliver-btn" onClick={openDeliverModal}>✓ Mark Order {activeIdx+1} Delivered</button>
              {orders[activeIdx]?.customer_phone ? (
                <a href={`tel:${orders[activeIdx].customer_phone}`} className="call-customer-btn">
                  📞 Call Customer{orders[activeIdx].customer_name ? ` (${orders[activeIdx].customer_name})` : ""}
                </a>
              ) : (
                <div style={{textAlign:"center",fontSize:11,color:"#8A96B5",fontWeight:600,marginTop:6}}>
                  📵 Customer phone not available
                </div>
              )}
              <button className="logout-btn" onClick={logout}>Logout</button>
            </div>
          </>
        ):(
          <div className="no-order">
            <div style={{fontSize:48,marginBottom:10}}>⏳</div>
            <div style={{fontSize:16,fontWeight:800,color:"#0D1B3E",marginBottom:4}}>Waiting for assignment</div>
            <div style={{fontSize:13,color:"#8A96B5",marginBottom:16}}>Your shopkeeper will assign a delivery to you</div>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        )}
      </div>

      {showModal&&(
        <div className="modal-bg">
          <div className="modal">
            <div className="m-handle"/><div className="m-title">✅ Mark as Delivered</div><div className="m-sub">Complete all steps to confirm delivery</div>
            <div className="progress">
              <div className={`ps ${step==="otp"?"active":otpOk?"done":""}`}>🔐 OTP</div>
              <div className={`ps ${step==="photos"?"active":(pFile&&cFile)?"done":""}`}>📸 Photos</div>
              <div className={`ps ${step==="confirm"?"active":""}`}>✅ Confirm</div>
            </div>
            {step==="otp"&&(
              <div className="m-body">
                <div style={{background:"#EBF1FF",borderRadius:12,padding:"12px 14px",fontSize:13,color:"#1A6BFF",fontWeight:600,marginBottom:14,lineHeight:1.5}}>Ask the customer for their 6-digit OTP.</div>
                {!otpOk?(
                  <><input className="otp-in" type="number" placeholder="------" value={otp} onChange={e=>setOtp(e.target.value.slice(0,6))}/>
                  <button className="otp-btn" onClick={checkOtp} disabled={otp.length<6}>Verify OTP →</button></>
                ):(
                  <><div className="ok-box">✅ OTP Verified — Customer confirmed!</div>
                  <button className="deliver-btn" onClick={()=>setStep("photos")}>Next: Take Photos →</button></>
                )}
                <button style={{width:"100%",padding:11,background:"none",border:"none",color:"#8A96B5",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:8}} onClick={()=>setShowModal(false)}>Cancel</button>
              </div>
            )}
            {step==="photos"&&(
              <div className="m-body">
                <div style={{fontSize:12,color:"#8A96B5",marginBottom:12,fontWeight:500}}>Both photos required. Camera only.</div>
                <div style={{fontSize:11,fontWeight:800,color:"#8A96B5",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6}}>📦 Products Photo *</div>
                <div className={`cam-box ${pPrev?"got":""}`} onClick={()=>!pPrev&&openCam("p")}>
                  {pPrev?<div style={{position:"relative"}}><div className="live-tag">LIVE</div><img src={pPrev} className="prev-img" alt="p"/><div className="retake-bar"><button className="retake-btn" onClick={e=>{e.stopPropagation();setPFile(null);setPPrev("");openCam("p");}}>🔄 Retake</button></div></div>
                  :<div className="cam-inner"><div className="cam-emo">📦</div><div className="cam-t">Tap to photograph products</div><div className="cam-r">📵 Camera only</div></div>}
                </div>
                <div style={{fontSize:11,fontWeight:800,color:"#8A96B5",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6}}>🤝 Customer Handoff *</div>
                <div className={`cam-box ${cPrev?"got":""}`} onClick={()=>!cPrev&&openCam("c")}>
                  {cPrev?<div style={{position:"relative"}}><div className="live-tag">LIVE</div><img src={cPrev} className="prev-img" alt="c"/><div className="retake-bar"><button className="retake-btn" onClick={e=>{e.stopPropagation();setCFile(null);setCPrev("");openCam("c");}}>🔄 Retake</button></div></div>
                  :<div className="cam-inner"><div className="cam-emo">🤝</div><div className="cam-t">Tap to photograph customer</div><div className="cam-r">📵 Camera only</div></div>}
                </div>
                <button className="deliver-btn" disabled={!pFile||!cFile} onClick={()=>setStep("confirm")} style={{marginBottom:10}}>{!pFile||!cFile?"Take both photos first":"Next: Confirm →"}</button>
                <button style={{width:"100%",padding:11,background:"none",border:"none",color:"#8A96B5",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>setStep("otp")}>← Back</button>
              </div>
            )}
            {step==="confirm"&&(
              <div className="m-body">
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  <img src={pPrev} style={{flex:1,height:80,objectFit:"cover",borderRadius:10,border:"1.5px solid #E4EAFF"}} alt="p"/>
                  <img src={cPrev} style={{flex:1,height:80,objectFit:"cover",borderRadius:10,border:"1.5px solid #E4EAFF"}} alt="c"/>
                </div>
                <div style={{background:"#E6FAF4",border:"1.5px solid #B8E8D4",borderRadius:12,padding:"12px 14px",marginBottom:14}}>
                  <div style={{fontSize:12,fontWeight:800,color:"#00875A",marginBottom:4}}>✅ OTP Verified · 📸 Photos taken</div>
                  <div style={{fontSize:11,color:"#4A5880",fontWeight:600}}>Photos will be shared with the shopkeeper as proof.</div>
                </div>
                {saving&&<div style={{textAlign:"center",padding:"10px 0",fontSize:14,fontWeight:700,color:"#1A6BFF"}}>Uploading...</div>}
              </div>
            )}
            {step==="confirm"&&<button className="confirm-btn" onClick={submit} disabled={saving}>{saving?"Completing...":"✅ Confirm Delivery"}</button>}
          </div>
        </div>
      )}

      {camOpen&&(
        <div className="cam-overlay">
          {/* Label */}
          <div className="cam-lbl">
            {camOpen==="p" ? "📦 Photograph the products clearly" : "🤝 Photograph customer receiving order"}
          </div>

          {/* Video viewport — fills entire screen, any aspect ratio */}
          <div className="cam-vid-wrap">
            <video ref={videoRef} className="cam-vid" autoPlay playsInline muted/>
          </div>

          {/* Controls */}
          <div className="cam-ctrl">
            {/* Close */}
            <button className="cam-btn close" onClick={stopCam} aria-label="Cancel">✕</button>

            {/* Shutter — centred, large */}
            <div className="shutter-wrap">
              <button className="shutter" onClick={snap} aria-label="Capture photo">
                <div style={{width:60,height:60,borderRadius:"50%",background:"white",border:"2px solid #E4EAFF"}}/>
              </button>
              <span className="shutter-label">Tap to capture</span>
            </div>

            {/* Flip */}
            <button className="cam-btn" onClick={flipCam} aria-label="Flip camera">🔄</button>
          </div>
        </div>
      )}
    </div>
  );
}
