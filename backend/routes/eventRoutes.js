

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getAllEvents,
  getEvent,
  getEventsByType,
  getUpcomingEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEventsAdmin,
  cancelEvent
} = require('../controllers/eventController');


const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllEvents);

router.get('/upcoming', getUpcomingEvents);


router.get('/type/:eventType', getEventsByType);



router.get('/admin/all', protect, authorize('admin'), getAllEventsAdmin);


router.post('/', protect, authorize('admin'), createEvent);


router.put('/:id/cancel', protect, authorize('admin'), cancelEvent);


router.put('/:id', protect, authorize('admin'), updateEvent);


router.delete('/:id', protect, authorize('admin'), deleteEvent);

router.get('/:identifier', getEvent);

module.exports = router;
