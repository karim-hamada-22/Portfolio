const express = require("express");
const router = express.Router();
const Contact = require("../models/contact.model");

// GET all contacts (for admin dashboard)
router.get("/", async (req, res) => {
  try {
    console.log("📡 GET /api/contact");

    const { status, limit } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    let contactsQuery = Contact.find(query).sort({ createdAt: -1 });

    if (limit) {
      contactsQuery = contactsQuery.limit(Number.parseInt(limit));
    }

    const contacts = await contactsQuery;
    console.log(`✅ Found ${contacts.length} contacts`);

    res.json(contacts);
  } catch (error) {
    console.error("❌ Error fetching contacts:", error);
    res.status(500).json({
      message: "Failed to fetch contacts",
      error: error.message,
    });
  }
});

// GET single contact
router.get("/:id", async (req, res) => {
  try {
    console.log("📡 GET /api/contact/:id - ID:", req.params.id);

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    console.log("✅ Contact found:", contact._id);
    res.json(contact);
  } catch (error) {
    console.error("❌ Error fetching contact:", error);
    res.status(500).json({
      message: "Failed to fetch contact",
      error: error.message,
    });
  }
});

// POST create new contact (public endpoint for contact form)
router.post("/", async (req, res) => {
  try {
    console.log("📡 POST /api/contact - Data:", req.body);

    // Validate required fields
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Create contact with additional metadata
    const contactData = {
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      status: "unread",
    };

    const contact = new Contact(contactData);
    const savedContact = await contact.save();

    console.log("✅ Contact message saved:", savedContact._id);

    // Return success without sensitive data
    res.status(201).json({
      message: "Thank you for your message! I'll get back to you soon.",
      contact: {
        id: savedContact._id,
        name: savedContact.name,
        subject: savedContact.subject,
        createdAt: savedContact.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Error creating contact:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      message: "Failed to send message. Please try again later.",
      error: error.message,
    });
  }
});

// PATCH update contact status (for admin)
router.patch("/:id/status", async (req, res) => {
  try {
    console.log("📡 PATCH /api/contact/:id/status - ID:", req.params.id);
    console.log("📡 New status:", req.body.status);

    const { status } = req.body;

    if (!status || !["unread", "read", "replied"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'unread', 'read', or 'replied'",
      });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    console.log("✅ Contact status updated:", updatedContact._id);
    res.json({
      message: "Contact status updated successfully",
      contact: updatedContact,
    });
  } catch (error) {
    console.error("❌ Error updating contact status:", error);
    res.status(500).json({
      message: "Failed to update contact status",
      error: error.message,
    });
  }
});

// DELETE contact (for admin)
router.delete("/:id", async (req, res) => {
  try {
    console.log("📡 DELETE /api/contact/:id - ID:", req.params.id);

    const deletedContact = await Contact.findByIdAndDelete(req.params.id);

    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    console.log("✅ Contact deleted:", req.params.id);
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting contact:", error);
    res.status(500).json({
      message: "Failed to delete contact",
      error: error.message,
    });
  }
});

// GET contact statistics (for dashboard)
router.get("/stats/summary", async (req, res) => {
  try {
    console.log("📡 GET /api/contact/stats/summary");

    const [total, unread, read, replied] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: "unread" }),
      Contact.countDocuments({ status: "read" }),
      Contact.countDocuments({ status: "replied" }),
    ]);

    const stats = {
      total,
      unread,
      read,
      replied,
      responseRate: total > 0 ? Math.round((replied / total) * 100) : 0,
    };

    console.log("✅ Contact stats:", stats);
    res.json(stats);
  } catch (error) {
    console.error("❌ Error fetching contact stats:", error);
    res.status(500).json({
      message: "Failed to fetch contact statistics",
      error: error.message,
    });
  }
});

module.exports = router;
