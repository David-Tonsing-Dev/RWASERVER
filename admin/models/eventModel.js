const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      required: true,
    },
    eventLocation: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    eventTag: {
      type: [String],
      required: true,
    },
    eventLink: {
      type: String,
      required: true,
    },
    eventMeetUpLink: {
      type: String,
      required: true,
    },
    eventDescription: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);
