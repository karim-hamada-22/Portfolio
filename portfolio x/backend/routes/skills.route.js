const express = require("express");
const { body, validationResult } = require("express-validator");
const Skill = require("../models/skill.model");
const { auth, adminAuth } = require("../middleware/auth.middleware");

const router = express.Router();

// Get all skills (public)
router.get("/", async (req, res) => {
  try {
    console.log("📡 GET /api/skills - Fetching all skills");

    const skills = await Skill.find({}).sort({ createdAt: -1 });

    console.log(`✅ Found ${skills.length} skills`);
    console.log(
      "📊 Skills data:",
      skills.map((s) => ({ id: s._id, name: s.name, category: s.category }))
    );

    // Return the skills array directly (not wrapped in an object)
    res.json(skills);
  } catch (error) {
    console.error("❌ Error fetching skills:", error);
    res.status(500).json({
      message: "Error fetching skills",
      error: error.message,
    });
  }
});

// Get single skill (public)
router.get("/:id", async (req, res) => {
  try {
    console.log("📡 GET /api/skills/:id - ID:", req.params.id);
    const skill = await Skill.findById(req.params.id).populate(
      "createdBy",
      "username"
    );

    if (!skill) {
      console.log("❌ Skill not found");
      return res.status(404).json({ message: "Skill not found" });
    }

    console.log("✅ Skill found:", skill.name);
    res.json(skill);
  } catch (error) {
    console.error("❌ Error getting skill:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create skill (admin only)
router.post(
  "/",
  [auth, adminAuth],
  [
    body("name").trim().notEmpty().withMessage("Skill name is required"),
    body("category")
      .isIn([
        "frontend",
        "backend",
        "database",
        "tools",
        "soft-skills",
        "other",
      ])
      .withMessage("Invalid category"),
    body("proficiency")
      .isInt({ min: 1, max: 100 })
      .withMessage("Proficiency must be between 1 and 100"),
  ],
  async (req, res) => {
    try {
      console.log("📡 POST /api/skills - Creating skill");
      console.log("👤 User:", req.user.username, "Role:", req.user.role);
      console.log("📊 Skill data:", req.body);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("❌ Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const skillData = {
        ...req.body,
        createdBy: req.user._id,
      };

      const skill = new Skill(skillData);
      await skill.save();

      const populatedSkill = await Skill.findById(skill._id).populate(
        "createdBy",
        "username"
      );
      console.log("✅ Skill created successfully:", populatedSkill.name);

      res.status(201).json({
        message: "Skill created successfully",
        skill: populatedSkill,
      });
    } catch (error) {
      console.error("❌ Error creating skill:", error);
      res.status(400).json({
        message: "Error creating skill",
        error: error.message,
      });
    }
  }
);

// Update skill (admin only)
router.put("/:id", [auth, adminAuth], async (req, res) => {
  try {
    console.log("📡 PUT /api/skills/:id - Updating skill:", req.params.id);
    console.log("👤 User:", req.user.username, "Role:", req.user.role);
    console.log("📊 Update data:", req.body);

    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!skill) {
      console.log("❌ Skill not found:", req.params.id);
      return res.status(404).json({ message: "Skill not found" });
    }

    console.log("✅ Skill updated successfully:", skill.name);
    res.json({
      message: "Skill updated successfully",
      skill: skill,
    });
  } catch (error) {
    console.error("❌ Error updating skill:", error);
    res.status(400).json({
      message: "Error updating skill",
      error: error.message,
    });
  }
});

// Delete skill (admin only)
router.delete("/:id", [auth, adminAuth], async (req, res) => {
  try {
    console.log("📡 DELETE /api/skills/:id - Deleting skill:", req.params.id);
    console.log("👤 User:", req.user.username, "Role:", req.user.role);

    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      console.log("❌ Skill not found:", req.params.id);
      return res.status(404).json({ message: "Skill not found" });
    }

    console.log("✅ Skill deleted successfully:", skill.name);
    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting skill:", error);
    res.status(500).json({
      message: "Error deleting skill",
      error: error.message,
    });
  }
});

module.exports = router;
