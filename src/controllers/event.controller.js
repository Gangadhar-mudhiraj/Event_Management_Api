import asyncHandler from '../utils/asynncHandler.util.js';
import  eventSchema from "../validations/event.validation.js"
import  FailApiResponse from '../utils/FailApiResponse.util.js';
import SuccessApiResponse from "../utils/SuccessApiResponse.util.js"
import { pool } from '../config/db.js';

const createEvent = asyncHandler(async (req, res) => {
  const { error, value } = eventSchema.validate(req.body);
  console.log(value);
  if (error) {
    return res.status(400).json(new FailApiResponse({
      message: 'Validation failed',
      errors: error.details
    }));
  }  

  const { title, location, dateTime } = value;

  // Check if event date is in the past
  if (new Date(dateTime) < new Date()) {
    return res.status(400).json(new FailApiResponse({
      message: 'Event date cannot be in the past'
    }));
  }

  try {
    // Validate environment variable for max events
    const maxEventsLimit = process.env.EVENTS_MAX_CAPACITY ? parseInt(process.env.EVENTS_MAX_CAPACITY, 10) : 1000; // Default to 1000 if not set

    // First check total number of events
    const eventsCountQuery = await pool.query(
      'SELECT COUNT(*) FROM events'
    );
    const currentEventCount = parseInt(eventsCountQuery.rows[0].count, 10);

    // Check if event count exceeds the limit
    if (currentEventCount >= maxEventsLimit) {
      return res.status(400).json(new FailApiResponse({
        message: `Maximum event limit (${maxEventsLimit}) reached`
      }));
    }

    // Proceed with event creation if under limit
    const result = await pool.query(
      `INSERT INTO events (title, location, datetime) 
       VALUES ($1, $2, $3) RETURNING id, title, location, datetime`,
      [title, location, dateTime]
    );

    return res.status(201).json(new SuccessApiResponse({
      message: 'Event created successfully',
      data: result.rows[0]
    }));
  } catch (error) {
    // Log error details for debugging
    console.error('Error creating event:', error.message);
    console.error(error.stack); // Log stack trace for more detailed error info

    return res.status(500).json(new FailApiResponse({
      message: 'Failed to create event',
      error: error.message
    }));
  }
});

const getEventWithUsers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const eventQuery = await pool.query(
      `SELECT id, title, location, datetime FROM events WHERE id = $1`,
      [id]
    );

    if (eventQuery.rows.length === 0) {
      return res.status(404).json(new FailApiResponse({
        message: 'Event not found'
      }));
    }

    const usersQuery = await pool.query(
      `SELECT u.id, u.name, u.email 
       FROM users u
       JOIN registrations r ON u.id = r.user_id
       WHERE r.event_id = $1`,
      [id]
    );

    return res.status(200).json(new SuccessApiResponse({
      message: 'Event details retrieved successfully',
      data: {
        ...eventQuery.rows[0],
        registeredUsers: usersQuery.rows
      }
    }));
  } catch (error) {
    console.error('Error fetching event:', error);
    return res.status(500).json(new FailApiResponse({
      message: 'Failed to retrieve event details'
    }));
  }
});

const registerUser = asyncHandler(async (req, res) => {
  

  const { name, email, eventId } = req.body;

  try {
    // Check event exists and is in future
    const event = await pool.query(
      `SELECT id, datetime 
       FROM events WHERE id = $1`,
      [eventId]
    );

    if (event.rows.length === 0) {
      return res.status(404).json(new FailApiResponse({
        message: 'Event not found'
      }));
    }

    if (new Date(event.rows[0].datetime) < new Date()) {
      return res.status(400).json(new FailApiResponse({
        message: 'Event has already occurred'
      }));
    }

    // Check capacity
    const registrations = await pool.query(
      `SELECT COUNT(*) FROM registrations WHERE event_id = $1`,
      [eventId]
    );
    const currentRegistrations = parseInt(registrations.rows[0].count);
    const maxCapacity = parseInt(process.env.USERS_MAX_CAPACITY) || 100;

    if (currentRegistrations >= maxCapacity) {
      return res.status(400).json(new FailApiResponse({
        message: 'Event is at full capacity'
      }));
    }

    // Find or create user
    let user = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    let userId;
    if (user.rows.length === 0) {
      const newUser = await pool.query(
        `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id`,
        [name, email]
      );
      userId = newUser.rows[0].id;
    } else {
      userId = user.rows[0].id;
    }

    // Check for existing registration
    const existingRegistration = await pool.query(
      `SELECT id FROM registrations WHERE user_id = $1 AND event_id = $2`,
      [userId, eventId]
    );

    if (existingRegistration.rows.length > 0) {
      return res.status(409).json(new FailApiResponse({
        message: 'User already registered for this event'
      }));
    }

    // Create registration
    await pool.query(
      `INSERT INTO registrations (user_id, event_id) VALUES ($1, $2)`,
      [userId, eventId]
    );

    return res.status(201).json(new SuccessApiResponse({
      message: 'Registration successful'
    }));
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json(new FailApiResponse({
      message: 'Registration failed'
    }));
  }
});

const cancelUserRegistration = asyncHandler(async (req, res) => {
  const { id: userId, eventId } = req.params;

  try {
    // 1. Check if user exists
    const user = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) {
      return res.status(404).json(new FailApiResponse({
        message: 'User not found'
      }));
    }

    // 2. Check if event exists
    const event = await pool.query('SELECT id FROM events WHERE id = $1', [eventId]);
    if (event.rows.length === 0) {
      return res.status(404).json(new FailApiResponse({
        message: 'Event not found'
      }));
    }

    // 3. Check if registration exists
    const registration = await pool.query(
      'SELECT id FROM registrations WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
    );
    
    if (registration.rows.length === 0) {
      return res.status(404).json(new FailApiResponse({
        message: 'Registration not found'
      }));
    }

    // 4. Delete the registration
    await pool.query(
      'DELETE FROM registrations WHERE user_id = $1 AND event_id = $2',
      [userId, eventId]
    );

    return res.status(200).json(new SuccessApiResponse({
      message: 'Registration cancelled successfully'
    }));
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return res.status(500).json(new FailApiResponse({
      message: 'Failed to cancel registration'
    }));
  }
});

const listUpcomingEvents = asyncHandler(async (req, res) => {
  try {
    const events = await pool.query(
      `SELECT id, title, location, datetime 
       FROM events 
       WHERE datetime >= NOW() 
       ORDER BY datetime ASC, location ASC`
    );

    return res.status(200).json(new SuccessApiResponse({
      message: 'Upcoming events retrieved',
      data: events.rows
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json(new FailApiResponse({
      message: 'Failed to retrieve events'
    }));
  }
});

const getEventStats = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await pool.query(
      `SELECT id, title FROM events WHERE id = $1`,
      [eventId]
    );

    if (event.rows.length === 0) {
      return res.status(404).json(new FailApiResponse({
        message: 'Event not found'
      }));
    }

    const registrations = await pool.query(
      `SELECT COUNT(*) FROM registrations WHERE event_id = $1`,
      [eventId]
    );

    const totalRegistrations = parseInt(registrations.rows[0].count);
    const maxCapacity =parseInt(process.env.USERS_MAX_CAPACITY) || 100;
    const remainingCapacity = Math.max(0, maxCapacity - totalRegistrations);
    const percentageUsed = maxCapacity > 0 
      ? Math.round((totalRegistrations / maxCapacity) * 100) 
      : 0;

    return res.status(200).json(new SuccessApiResponse({
      message: 'Event statistics retrieved',
      data: {
        eventId: event.rows[0].id,
        title: event.rows[0].title,
        totalRegistrations,
        maxCapacity,
        remainingCapacity,
        percentageUsed
      }
    }));
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json(new FailApiResponse({
      message: 'Failed to retrieve event statistics'
    }));
  }
});

export {
  createEvent,
  getEventWithUsers,
  registerUser,
  cancelUserRegistration,
  listUpcomingEvents,
  getEventStats
};