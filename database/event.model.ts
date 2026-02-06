import { Schema, model, models, Document } from 'mongoose';

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: ['online', 'offline', 'hybrid'],
      lowercase: true,
      trim: true,
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

// Pre-save hook for slug generation and data normalization
EventSchema.pre('save', function (next) {
  // Generate slug only if title is modified or document is new
  if (this.isModified('title')) {
    this.slug = generateSlug(this.title);
  }

  // Normalize and validate date to ISO format
  if (this.isModified('date')) {
    this.date = normalizeDate(this.date);
  }

  // Normalize time format (HH:MM)
  if (this.isModified('time')) {
    this.time = normalizeTime(this.time);
  }

  next();
});

// Create unique index on slug for faster lookups and uniqueness
EventSchema.index({ slug: 1 }, { unique: true });

/**
 * Generates a URL-friendly slug from a title
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Normalizes date string to ISO 8601 format (YYYY-MM-DD)
 * Accepts various date formats and converts them to standard format
 */
function normalizeDate(dateStr: string): string {
  const date = new Date(dateStr);
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format. Please provide a valid date.');
  }

  // Return ISO date string (YYYY-MM-DD)
  return date.toISOString().split('T')[0];
}

/**
 * Normalizes time to HH:MM format (24-hour)
 * Ensures consistent time storage
 */
function normalizeTime(timeStr: string): string {
  // Match common time formats: HH:MM, H:MM, HH:MM AM/PM, etc.
  const timeRegex = /^(\d{1,2}):(\d{2})(\s?(AM|PM|am|pm))?$/;
  const match = timeStr.trim().match(timeRegex);

  if (!match) {
    throw new Error('Invalid time format. Please use HH:MM or HH:MM AM/PM format.');
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[4]?.toUpperCase();

  // Convert 12-hour format to 24-hour format
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  // Validate hours and minutes
  if (hours < 0 || hours > 23 || parseInt(minutes, 10) < 0 || parseInt(minutes, 10) > 59) {
    throw new Error('Invalid time. Hours must be 0-23 and minutes must be 0-59.');
  }

  // Return normalized time in HH:MM format
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// Export model (reuse existing model in development to prevent OverwriteModelError)
const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
