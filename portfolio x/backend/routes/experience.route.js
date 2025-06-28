const express = require("express");
const { body, validationResult } = require("express-validator");
const Experience = require("../models/experience.model");
const { auth, adminAuth } = require("../middleware/auth.middleware");

const router = express.Router();

// Get all experiences (public)
router.get("/", async (req, res) => {
  try {
    console.log("📡 GET /api/experience - Fetching all experiences");

    const experiences = await Experience.find({}).sort({ startDate: -1 });

    console.log(`✅ Found ${experiences.length} experiences`);
    console.log(
      "📊 Experiences data:",
      experiences.map((e) => ({
        id: e._id,
        jobTitle: e.jobTitle,
        company: e.company,
        startDate: e.startDate,
      }))
    );

    // Return the experiences array directly (not wrapped in an object)
    res.json(experiences);
  } catch (error) {
    console.error("❌ Error fetching experiences:", error);
    res.status(500).json({
      message: "Error fetching experiences",
      error: error.message,
    });
  }
});

// Get single experience (public)
router.get("/:id", async (req, res) => {
  try {
    console.log("📡 GET /api/experience/:id - ID:", req.params.id);
    const experience = await Experience.findById(req.params.id).populate(
      "createdBy",
      "username"
    );

    if (!experience) {
      console.log("❌ Experience not found");
      return res.status(404).json({ message: "Experience not found" });
    }

    console.log("✅ Experience found:", experience.jobTitle);
    res.json(experience);
  } catch (error) {
    console.error("❌ Error getting experience:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create experience (admin only)
router.post(
  "/",
  [auth, adminAuth],
  [
    body("jobTitle").trim().notEmpty().withMessage("Job title is required"),
    body("company").trim().notEmpty().withMessage("Company is required"),
    body("startDate").isISO8601().withMessage("Valid start date is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
  ],
  async (req, res) => {
    try {
      console.log("📡 POST /api/experience - Creating experience");
      console.log("👤 User:", req.user.username, "Role:", req.user.role);
      console.log("📊 Experience data:", req.body);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("❌ Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const experienceData = {
        ...req.body,
        createdBy: req.user._id,
      };

      const experience = new Experience(experienceData);
      await experience.save();

      const populatedExperience = await Experience.findById(
        experience._id
      ).populate("createdBy", "username");
      console.log(
        "✅ Experience created successfully:",
        populatedExperience.jobTitle
      );

      res.status(201).json({
        message: "Experience created successfully",
        experience: populatedExperience,
      });
    } catch (error) {
      console.error("❌ Error creating experience:", error);
      res.status(400).json({
        message: "Error creating experience",
        error: error.message,
      });
    }
  }
);

// Update experience (admin only)
router.put("/:id", [auth, adminAuth], async (req, res) => {
  try {
    console.log(
      "📡 PUT /api/experience/:id - Updating experience:",
      req.params.id
    );
    console.log("👤 User:", req.user.username, "Role:", req.user.role);
    console.log("📊 Update data:", req.body);

    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!experience) {
      console.log("❌ Experience not found:", req.params.id);
      return res.status(404).json({ message: "Experience not found" });
    }

    console.log("✅ Experience updated successfully:", experience.jobTitle);
    res.json({
      message: "Experience updated successfully",
      experience: experience,
    });
  } catch (error) {
    console.error("❌ Error updating experience:", error);
    res.status(400).json({
      message: "Error updating experience",
      error: error.message,
    });
  }
});

// Delete experience (admin only)
router.delete("/:id", [auth, adminAuth], async (req, res) => {
  try {
    console.log(
      "📡 DELETE /api/experience/:id - Deleting experience:",
      req.params.id
    );
    console.log("👤 User:", req.user.username, "Role:", req.user.role);

    const experience = await Experience.findByIdAndDelete(req.params.id);

    if (!experience) {
      console.log("❌ Experience not found:", req.params.id);
      return res.status(404).json({ message: "Experience not found" });
    }

    console.log("✅ Experience deleted successfully:", experience.jobTitle);
    res.json({ message: "Experience deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting experience:", error);
    res.status(500).json({
      message: "Error deleting experience",
      error: error.message,
    });
  }
});

module.exports = router;
