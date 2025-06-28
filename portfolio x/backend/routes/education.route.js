const express = require("express");
const router = express.Router();
const Education = require("../models/education.model");

// GET all educations
router.get("/", async (req, res) => {
  try {
    const educations = await Education.find().sort({ startDate: -1 });
    res.json(educations);
  } catch (error) {
    console.error("Error fetching educations:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch educations", error: error.message });
  }
});

// POST create education
router.post("/", async (req, res) => {
  try {
    const education = new Education(req.body);
    const savedEducation = await education.save();
    res.status(201).json({
      message: "Education created successfully",
      education: savedEducation,
    });
  } catch (error) {
    console.error("Error creating education:", error);
    res
      .status(500)
      .json({ message: "Failed to create education", error: error.message });
  }
});

// PUT update education
router.put("/:id", async (req, res) => {
  try {
    const updatedEducation = await Education.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedEducation) {
      return res.status(404).json({ message: "Education not found" });
    }

    res.json({
      message: "Education updated successfully",
      education: updatedEducation,
    });
  } catch (error) {
    console.error("Error updating education:", error);
    res
      .status(500)
      .json({ message: "Failed to update education", error: error.message });
  }
});

// DELETE education
router.delete("/:id", async (req, res) => {
  try {
    const deletedEducation = await Education.findByIdAndDelete(req.params.id);

    if (!deletedEducation) {
      return res.status(404).json({ message: "Education not found" });
    }

    res.json({ message: "Education deleted successfully" });
  } catch (error) {
    console.error("Error deleting education:", error);
    res
      .status(500)
      .json({ message: "Failed to delete education", error: error.message });
  }
});

module.exports = router;
