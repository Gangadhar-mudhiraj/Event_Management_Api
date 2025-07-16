import { Router } from "express";
import {
  createEvent,
  getEventWithUsers,
  registerUser,
  cancelUserRegistration,
  getEventStats,
  listUpcomingEvents
} from "../controllers/event.controller.js";

const router = Router();

router.post('/', createEvent);
router.get('/:id', getEventWithUsers);
router.post('/register', registerUser);
router.delete('/cancel/:id/:eventId', cancelUserRegistration);
router.get('/upcoming/events', listUpcomingEvents);
router.get('/stats/:eventId', getEventStats);

export default router;