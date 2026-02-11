import { Event } from "@/database";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    let event;

    try {
      event = Object.fromEntries(formData.entries());
    } catch (error) {
      console.log(error);
      return NextResponse.json({ message: "Invalid form data" }, { status: 400 });
    }

    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ message: "Image file is required" }, { status: 400 });
    }

    // Fix: Properly handle null and type checking
    const tagsData = formData.get('tags');
    const agendaData = formData.get('agenda');

    if (!tagsData || !agendaData) {
      return NextResponse.json(
        { message: "Tags and agenda are required" }, 
        { status: 400 }
      );
    }

    // Ensure they are strings before parsing
    const tags = JSON.parse(tagsData.toString());
    const agenda = JSON.parse(agendaData.toString());

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'DevEvent' }, 
        (error, results) => {
          if (error) return reject(error);
          resolve(results);
        }
      ).end(buffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;

    const createdEvent = await Event.create({
      ...event,
      tags: tags,
      agenda: agenda,
    });

    return NextResponse.json({ 
      message: "Event Created Successfully", 
      event: createdEvent 
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      message: "Event Creation Failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();

    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json({ 
      message: "Events fetched successfully", 
      events 
    }, { status: 200 });
  } catch (error) {
    console.log("Error fetching events:", error);
    return NextResponse.json({
      message: "Event fetching failed", 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}