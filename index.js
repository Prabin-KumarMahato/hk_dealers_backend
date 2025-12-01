// index.js (CLEAN VERSION - CommonJS)

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

// Load env vars
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- SUPABASE CLIENT (backend uses service role key) ---
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- ROUTES ---

// Health check
app.get("/", (req, res) => {
    res.json({ status: "HK Dealers API running" });
});

// 🕒 Get all watches (for inventory + customer catalog)
app.get("/api/inventory", async(req, res) => {
    const { data, error } = await supabase
        .from("watches")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Get inventory error:", error);
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

// ➕ Add new watch (Admin – Add Watch form)
app.post("/api/inventory", async(req, res) => {
    const { brand, model, type, price, quantity, image_url, gender } = req.body;

    const { data, error } = await supabase.from("watches").insert([{
        brand,
        model,
        type,
        price,
        quantity,
        image_url: image_url || null,
        gender: gender || "Unisex", // default if not provided
    }, ]);

    if (error) {
        console.error("Insert watch error:", error);
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
});

// 💳 Create sale (Sales & Billing)
app.post("/api/sales", async(req, res) => {
    const { customer_name, phone, total, discount } = req.body;

    const { data, error } = await supabase.from("sales").insert([{
        customer_name,
        phone,
        total,
        discount,
    }, ]);

    if (error) {
        console.error("Create sale error:", error);
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
});

// 🔧 Track repair status (Customer dashboard)
app.post("/api/repairs/track", async(req, res) => {
    const { repair_id, phone } = req.body;

    const { data, error } = await supabase
        .from("repairs")
        .select("*")
        .eq("repair_id", repair_id)
        .eq("customer_phone", phone)
        .maybeSingle();

    if (error || !data) {
        console.error("Repair track error:", error);
        return res.status(404).json({ error: "Repair not found" });
    }

    res.json(data);
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`HK Dealers backend running on port ${PORT}`);
});