const express = require("express");
const { body, validationResult } = require("express-validator");
const PersonalInfo = require("../models/personalInfo.model");
const { auth, adminAuth } = require("../middleware/auth.middleware");

const router = express.Router();

// Get personal info (public)
router.get("/", async (req, res) => {
  try {
    console.log("📖 Getting personal info...");
    const personalInfo = await PersonalInfo.findOne({}).populate(
      "createdBy",
      "username"
    );

    if (!personalInfo) {
      console.log("ℹ️ No personal information found");
      return res
        .status(404)
        .json({ message: "Personal information not found" });
    }

    console.log("✅ Personal info retrieved successfully");
    res.json(personalInfo);
  } catch (error) {
    console.error("❌ Error getting personal info:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create or update personal info (admin only)
router.post(
  "/",
  [auth, adminAuth],
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("bio").trim().notEmpty().withMessage("Bio is required"),
    body("email").isEmail().withMessage("Valid email is required"),
  ],
  async (req, res) => {
    try {
      console.log("💾 Saving personal info...");
      console.log("User ID:", req.user._id);
      console.log("User Role:", req.user.role);
      console.log("Request body:", {
        ...req.body,
        socialLinks: req.body.socialLinks ? "present" : "missing",
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("❌ Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const personalInfoData = {
        ...req.body,
        createdBy: req.user._id,
      };

      // Check if personal info already exists
      let personalInfo = await PersonalInfo.findOne({});

      if (personalInfo) {
        console.log("🔄 Updating existing personal info...");
        // Update existing
        personalInfo = await PersonalInfo.findByIdAndUpdate(
          personalInfo._id,
          personalInfoData,
          {
            new: true,
            runValidators: true,
          }
        ).populate("createdBy", "username");

        console.log("✅ Personal information updated successfully");
        res.json({
          message: "Personal information updated successfully",
          personalInfo,
        });
      } else {
        console.log("➕ Creating new personal info...");
        // Create new
        personalInfo = new PersonalInfo(personalInfoData);
        await personalInfo.save();

        const populatedPersonalInfo = await PersonalInfo.findById(
          personalInfo._id
        ).populate("createdBy", "username");

        console.log("✅ Personal information created successfully");
        res.status(201).json({
          message: "Personal information created successfully",
          personalInfo: populatedPersonalInfo,
        });
      }
    } catch (error) {
      console.error("❌ Error saving personal info:", error);
      res.status(500).json({
        message: "Server error",
        error: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
);

module.exports = router;
