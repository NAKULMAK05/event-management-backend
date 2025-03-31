import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  schedule: { type: String },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Correct field name
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }
],
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
