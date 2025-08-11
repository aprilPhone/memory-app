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

    const memories = await prisma.memory.findMany({
      where: {
        userId: session.user.id,
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

    return NextResponse.json(memories);
  } catch (error) {
    console.error("Error fetching memories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      type,
      fileUrl,
      originalFileName,
      url,
      categoryId,
      isFavorite,
    } = body;

    if (!title || !content || !type || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: session.user.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const memory = await prisma.memory.create({
      data: {
        title,
        content,
        type,
        fileUrl,
        originalFileName,
        url,
        categoryId,
        userId: session.user.id,
        isFavorite: isFavorite || false,
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

    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    console.error("Error creating memory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      title,
      content,
      type,
      fileUrl,
      originalFileName,
      url,
      categoryId,
      isFavorite,
    } = body;

    if (!id || !title || !content || !type || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify memory belongs to user
    const existingMemory = await prisma.memory.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingMemory) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: session.user.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        title,
        content,
        type,
        fileUrl,
        originalFileName,
        url,
        categoryId,
        isFavorite:
          isFavorite !== undefined ? isFavorite : existingMemory.isFavorite,
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
    console.error("Error updating memory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Memory ID is required" },
        { status: 400 }
      );
    }

    // Verify memory belongs to user
    const existingMemory = await prisma.memory.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingMemory) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    }

    await prisma.memory.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Memory deleted successfully" });
  } catch (error) {
    console.error("Error deleting memory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
