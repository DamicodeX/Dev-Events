"use client"

import { useState } from 'react'
import { createBooking } from '@/lib/actions/booking.action';
import posthog from 'posthog-js';

const BookEvents = ({ eventId, slug }: { eventId: string, slug: string }) => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { success } = await createBooking({ eventId, slug, email })

        if ( success) {
            setSubmitted(true);
            posthog.capture('booking_created', { eventId, slug, email });
        } else {
            console.log("Booking Failed");
            posthog.captureException("Booking creation failed")
        }
        setTimeout(() => {
            setSubmitted(true);
        }, 1000)

    }
    return (
        <div id="book-event" className=''>
            {submitted ? (
                <p className="text-sm">Thank you for signing up!</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                            placeholder='Enter you email address'
                        />
                    </div>
                    <button type="submit" className="button-submit">Submit</button>
                </form>
            )}
        </div>
    )
}

export default BookEvents