import { createClient } from "@supabase/supabase-js"; // or const { createClient } = require("@supabase/supabase-js");

// Remove duplicate declaration

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

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

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// ➕ Add new watch (Admin – Add Watch form)
app.post("/api/inventory", async(req, res) => {
    const { brand, model, type, price, quantity, image_url } = req.body;

    const { data, error } = await supabase.from("watches").insert([{
        brand,
        model,
        type,
        price,
        quantity,
        image_url,
    }, ]);

    if (error) return res.status(500).json({ error: error.message });
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

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

// 🔧 Track repair status (Customer dashboard)
app.post("/api/inventory", async(req, res) => {
    const { brand, model, type, price, quantity, image_url, gender } = req.body;

    const { data, error } = await supabase.from("watches").insert([{
        brand,
        model,
        type,
        price,
        quantity,
        image_url,
        gender: gender || "Unisex", // ✅ default if not provided
    }, ]);

    if (error) {
        console.error("Insert error", error);
        return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
});


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`HK Dealers backend running on port ${PORT}`);
});