import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favoriteMemories = await prisma.memory.findMany({
      where: {
        userId: session.user.id,
        isFavorite: true,
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(favoriteMemories);
  } catch (error) {
    console.error("Error fetching favorite memories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { memoryId, isFavorite } = body;

    if (!memoryId || typeof isFavorite !== "boolean") {
      return NextResponse.json(
        { error: "Memory ID and favorite status are required" },
        { status: 400 }
      );
    }

    // Verify memory belongs to user
    const existingMemory = await prisma.memory.findFirst({
      where: {
        id: memoryId,
        userId: session.user.id,
      },
    });

    if (!existingMemory) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    const memory = await prisma.memory.update({
      where: {
        id: memoryId,
      },
      data: {
        isFavorite,
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json(memory);
  } catch (error) {
    console.error("Error updating favorite status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
