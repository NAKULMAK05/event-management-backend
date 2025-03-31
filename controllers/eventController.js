import Event from "../models/Event.js";
 
// Create Event
// Create Event
const createEvent = async (req, res) => {
  const { title, description, thumbnail, date, time, schedule } = req.body;

  // Ensure that the user is authenticated and exists
  if (!req.user || !req.user._id) {
    return res.status(401).json({ msg: "Unauthorized: No user found" });
  }

  // Validate required fields
  if (!title || !description || !date || !time) {
    return res.status(400).json({ msg: "Missing required fields" });
  }

  try {
    console.log("📌 Creating event with data:", req.body);

    // Create a new event and associate it with the authenticated user (organizer and createdBy)
    const event = new Event({
      title,
      description,
      thumbnail,
      date,
      time,
      schedule,
      organizer: req.user._id, // Assign the user _id to the event's organizer field
      createdBy: req.user._id,  // Set the createdBy field to the authenticated user's ID
    });

    // Save the event to the database
    await event.save();
    console.log("✅ Event Created Successfully:", event);

    // Respond with the created event
    res.status(201).json(event);
  } catch (err) {
    console.error("❌ Error creating event:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};



// Get All Events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("organizer", "firstName lastName email")
      .populate("comments.userId", "firstName lastName"); // ✅ Fixed here
    
    res.json(events);
  } catch (err) {
    console.error("❌ Error fetching events:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


// Update Event
const updateEvent = async (req, res) => {
  try {
    const { title, description, date, time, schedule, thumbnail } = req.body;
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, date, time, schedule, thumbnail },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ msg: "Event not found" });
    }
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Delete Event
 // Example in your eventController.js
const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ msg: "Event not found" });
    }
    res.status(200).json({ msg: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};


// Like or Unlike Event
const likeEvent = async (req, res) => {
  const { id } = req.params;

  if (!req.userId) {
    return res.status(401).json({ msg: "Unauthorized: No user ID found" });
  }

  try {
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    if (event.likes.includes(req.userId)) {
      event.likes = event.likes.filter((userId) => userId.toString() !== req.userId);
    } else {
      event.likes.push(req.userId);
    }

    await event.save();
    res.json(event);
  } catch (err) {
    console.error("❌ Error liking event:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Add Comment to Event
const addComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!req.userId) {
    return res.status(401).json({ msg: "Unauthorized: No user ID found" });
  }

  if (!text) {
    return res.status(400).json({ msg: "Comment text is required" });
  }

  try {
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ msg: "Event not found" });

    event.comments.push({ userId: req.userId, text, date: new Date() }); // ✅ Fixed: `userId`
    await event.save();

    res.json(event);
  } catch (err) {
    console.error("❌ Error adding comment:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

export { createEvent, getEvents, updateEvent, deleteEvent, likeEvent, addComment };