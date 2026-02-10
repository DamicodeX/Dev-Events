import { NextRequest, NextResponse } from "next/server";
import { Event, IEvent } from "@/database";
import connectDB from "@/lib/mongodb";

// Route context type for dynamic route parameters
interface RouteContext {
  params: Promise<{ slug: string }>;
}

// Standardized API response type
interface ApiResponse<T = null> {
  message: string;
  event?: T;
  error?: string;
}

/**
 * Validates that the slug is a non-empty string with valid URL-safe characters
 * Slugs should only contain lowercase letters, numbers, and hyphens
 */
function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return typeof slug === "string" && slug.length > 0 && slugRegex.test(slug);
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its unique slug identifier
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<IEvent>>> {
  try {
    // Await params in Next.js 15+ (params is now a Promise)
    const { slug } = await context.params;

    // Validate slug parameter exists and is properly formatted
    if (!slug || !isValidSlug(slug)) {
      return NextResponse.json(
        {
          message: "Invalid slug parameter",
          error: "Slug must be a non-empty string containing only lowercase letters, numbers, and hyphens",
        },
        { status: 400 }
      );
    }

    // Establish database connection
    await connectDB();

    // Query event by slug (indexed field for fast lookup)
    const event = await Event.findOne({ slug }).lean<IEvent>();

    // Handle case where event is not found
    if (!event) {
      return NextResponse.json(
        {
          message: "Event not found",
          error: `No event exists with slug: ${slug}`,
        },
        { status: 404 }
      );
    }

    // Return successful response with event data
    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 }
    );
  } catch (error) {
    // Log error for server-side debugging (avoid exposing internals to client)
    console.error("Error fetching event by slug:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch event",
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
