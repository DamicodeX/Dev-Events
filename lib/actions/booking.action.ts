"use server";

import { Booking } from "@/database";
import connectDB from "../mongodb";

export const createBooking = async({ eventId, slug, email}: { eventId: string, slug: string, email: string })=> {

    try {
        await connectDB();

        const booking = await Booking.create({eventId, slug, email});
        return { status: true, booking: booking._id.toString() };
    } catch (error) {
        console.log("Creating Booking Failed",error);
        return { success: false};
    }
}