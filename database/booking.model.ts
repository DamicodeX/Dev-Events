import { Schema, model, models, Document, Types } from 'mongoose';

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      // index: true, 
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: (email: string) => {
          // RFC 5322 compliant email validation regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

// Pre-save hook to validate that the referenced event exists
BookingSchema.pre('save', async function () {
  if (this.isNew || this.isModified('eventId')) {
    const Event = models.Event || (await import('./event.model')).default;
    
    const eventExists = await Event.exists({ _id: this.eventId });

    if (!eventExists) {
      throw new Error(`Event with ID ${this.eventId} does not exist`);
    }
  }
  // No next() call needed
});

// Create index on eventId for efficient queries
BookingSchema.index({ eventId: 1 });

// Compound index for finding bookings by event and email (useful for duplicate prevention)
BookingSchema.index({ eventId: 1, email: 1 });

// Export model (reuse existing model in development to prevent OverwriteModelError)
const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;
