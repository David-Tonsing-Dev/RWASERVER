const cloudinary = require("../../config/cloudinary");
const Event = require("../models/eventModel");

const getEvents = async (req, res) => {
  try {
    let { page = 1, size = 10, filter, sortBy, order } = req.query;

    page = parseInt(page);
    size = parseInt(size);
    sortBy = sortBy || "createdAt";
    order = order?.toLowerCase() === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: order };

    const filterQuery = filter?.trim()
      ? {
          $or: [
            { title: { $regex: filter, $options: "i" } },
            { country: { $regex: filter, $options: "i" } },
            { eventLocation: { $regex: filter, $options: "i" } },
            { eventType: { $regex: filter, $options: "i" } },
            { eventTag: { $regex: filter, $options: "i" } },
          ],
        }
      : {};

    const events = await Event.find(filterQuery)
      .skip((page - 1) * size)
      .limit(size)
      .sort(sortOptions);

    const totalEvents = await Event.countDocuments(filterQuery);

    return res.status(200).json({
      events,
      total: totalEvents,
      status: true,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Event ID is required.",
      });
    }

    const eventData = await Event.findOne({ _id: id });

    if (!eventData) {
      return res.status(404).json({
        status: false,
        message: "Event not found.",
      });
    }

    return res.status(200).json({
      status: true,
      event: eventData,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const role = req.role;
    const {
      title,
      country,
      eventLocation,
      startDate,
      endDate,
      eventType,
      eventTag,
      eventLink,
      eventDescription,
      eventMeetUpLink,
    } = req.body;

    if (role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "You are not authorized to perform this action.",
      });

    if (
      !title ||
      !country ||
      !eventLocation ||
      !startDate ||
      !endDate ||
      !eventType ||
      !eventTag ||
      !eventLink ||
      !eventDescription ||
      !req.file
    ) {
      return res.status(400).json({
        status: false,
        message: "All fields are required to proceed.",
      });
    }

    const uploadImg = await cloudinary.uploader.upload(req.file.path, {
      use_filename: true,
      folder: "rwa/event",
    });

    if (!uploadImg)
      return res
        .status(500)
        .json({ status: false, message: "Error in uploading image" });

    const parsedTags = JSON.parse(eventTag);
    // const parsedTags = eventTag.split(",").map((tag) => tag.trim());

    const newEvent = new Event({
      title,
      image: uploadImg.secure_url,
      country,
      eventLocation,
      startDate,
      endDate,
      eventType,
      eventTag: parsedTags,
      eventLink,
      eventDescription,
      eventMeetUpLink,
    });
    await newEvent.save();

    return res.status(201).json({
      message: "Event created successfully",
      status: true,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const role = req.role;
    const { id } = req.params;
    const {
      title,
      country,
      eventLocation,
      startDate,
      endDate,
      eventType,
      eventTag,
      eventLink,
      eventDescription,
      eventMeetUpLink,
    } = req.body;

    if (role !== "SUPERADMIN") {
      return res.status(401).json({
        status: false,
        message: "You are not authorized to perform this action.",
      });
    }

    const parsedTags = JSON.parse(eventTag);

    const updatedData = {
      title,
      country,
      eventLocation,
      startDate,
      endDate,
      eventType,
      eventTag: parsedTags,
      eventLink,
      eventDescription,
      eventMeetUpLink,
    };

    if (req.file) {
      const uploadImg = await cloudinary.uploader.upload(req.file.path, {
        use_filename: true,
        folder: "rwa/event",
      });

      if (!uploadImg) {
        return res
          .status(500)
          .json({ status: false, message: "Error in uploading image" });
      }

      updatedData.image = uploadImg.secure_url;
    }

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: id },
      { $set: updatedData },
      { new: true }
    );

    if (!updatedEvent) {
      return res
        .status(404)
        .json({ status: false, message: "Event not found" });
    }

    return res.status(200).json({
      message: "Event updated successfully",
      status: true,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const role = req.role;
    const { id } = req.params;

    if (role !== "SUPERADMIN") {
      return res.status(401).json({
        status: false,
        message: "You are not authorized to perform this action.",
      });
    }
    const deletedEvent = await Event.findOneAndDelete({ _id: id });

    if (!deletedEvent) {
      return res.status(404).json({
        status: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getEventById,
};
