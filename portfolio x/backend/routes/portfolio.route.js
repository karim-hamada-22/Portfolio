const express = require("express");
const router = express.Router();
const Portfolio = require("../models/portfolio.model");

// GET all portfolios
router.get("/", async (req, res) => {
  try {
    console.log("📡 GET /api/portfolio");
    const portfolios = await Portfolio.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${portfolios.length} portfolios`);
    res.json(portfolios);
  } catch (error) {
    console.error("❌ Error fetching portfolios:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch portfolios", error: error.message });
  }
});

// POST create portfolio
router.post("/", async (req, res) => {
  try {
    console.log("📡 POST /api/portfolio - Data:", req.body);

    const portfolio = new Portfolio(req.body);
    const savedPortfolio = await portfolio.save();

    console.log("✅ Portfolio created:", savedPortfolio._id);
    res.status(201).json({
      message: "Portfolio created successfully",
      portfolio: savedPortfolio,
    });
  } catch (error) {
    console.error("❌ Error creating portfolio:", error);
    res
      .status(500)
      .json({ message: "Failed to create portfolio", error: error.message });
  }
});

// PUT update portfolio
router.put("/:id", async (req, res) => {
  try {
    console.log("📡 PUT /api/portfolio/:id - ID:", req.params.id);

    const updatedPortfolio = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPortfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    console.log("✅ Portfolio updated:", updatedPortfolio._id);
    res.json({
      message: "Portfolio updated successfully",
      portfolio: updatedPortfolio,
    });
  } catch (error) {
    console.error("❌ Error updating portfolio:", error);
    res
      .status(500)
      .json({ message: "Failed to update portfolio", error: error.message });
  }
});

// DELETE portfolio
router.delete("/:id", async (req, res) => {
  try {
    console.log("📡 DELETE /api/portfolio/:id - ID:", req.params.id);

    const deletedPortfolio = await Portfolio.findByIdAndDelete(req.params.id);

    if (!deletedPortfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    console.log("✅ Portfolio deleted:", req.params.id);
    res.json({ message: "Portfolio deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting portfolio:", error);
    res
      .status(500)
      .json({ message: "Failed to delete portfolio", error: error.message });
  }
});

module.exports = router;
