const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_SLOT_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;

const timeToMinutes = (time) => {
  const [hours, minutes] = String(time || '').split(':').map(Number);
  if ([hours, minutes].some((value) => Number.isNaN(value))) {
    return null;
  }

  return (hours * 60) + minutes;
};

const parseSlotRange = (slotTime) => {
  if (!TIME_SLOT_PATTERN.test(String(slotTime || '').trim())) {
    return null;
  }

  const [start, end] = slotTime.trim().split('-');
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  if (startMinutes === null || endMinutes === null || startMinutes >= endMinutes) {
    return null;
  }

  return {
    start,
    end,
    startMinutes,
    endMinutes
  };
};

const slotsOverlap = (firstSlotTime, secondSlotTime) => {
  const first = typeof firstSlotTime === 'string' ? parseSlotRange(firstSlotTime) : firstSlotTime;
  const second = typeof secondSlotTime === 'string' ? parseSlotRange(secondSlotTime) : secondSlotTime;

  if (!first || !second) {
    return false;
  }

  return first.startMinutes < second.endMinutes && second.startMinutes < first.endMinutes;
};

const sortSlots = (slots = []) => (
  [...slots].sort((left, right) => {
    const leftRange = parseSlotRange(left.time);
    const rightRange = parseSlotRange(right.time);

    if (!leftRange && !rightRange) return String(left.time || '').localeCompare(String(right.time || ''));
    if (!leftRange) return 1;
    if (!rightRange) return -1;

    if (leftRange.startMinutes !== rightRange.startMinutes) {
      return leftRange.startMinutes - rightRange.startMinutes;
    }

    return leftRange.endMinutes - rightRange.endMinutes;
  })
);

const normalizeAvailability = (availability = []) => (
  [...availability]
    .map((entry) => ({
      day: entry.day,
      slots: sortSlots((entry.slots || []).map((slot) => ({
        time: slot.time,
        available: slot.available !== false
      })))
    }))
    .sort((left, right) => DAY_ORDER.indexOf(left.day) - DAY_ORDER.indexOf(right.day))
);

const validateAvailability = (availability = []) => {
  for (const entry of availability) {
    const seen = new Set();
    const parsedSlots = [];

    for (const slot of entry.slots || []) {
      const normalizedTime = String(slot.time || '').trim();
      const parsed = parseSlotRange(normalizedTime);

      if (!parsed) {
        return { valid: false, message: `Invalid slot format for ${entry.day}: ${normalizedTime || 'empty slot'}` };
      }

      if (seen.has(normalizedTime)) {
        return { valid: false, message: `Duplicate slot ${normalizedTime} found for ${entry.day}` };
      }

      const conflictingSlot = parsedSlots.find((existing) => slotsOverlap(existing.parsed, parsed));
      if (conflictingSlot) {
        return {
          valid: false,
          message: `Overlapping slots are not allowed on ${entry.day}: ${conflictingSlot.time} overlaps ${normalizedTime}`
        };
      }

      seen.add(normalizedTime);
      parsedSlots.push({ time: normalizedTime, parsed });
    }
  }

  return { valid: true };
};

module.exports = {
  DAY_ORDER,
  parseSlotRange,
  slotsOverlap,
  sortSlots,
  normalizeAvailability,
  validateAvailability
};
