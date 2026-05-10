import { prisma } from "../src/server/db";

async function main() {
  console.log("Verifying Prisma connection...");
  try {
    const count = await prisma.shortLink.count();
    console.log(`Current links: ${count}`);

    console.log("Creating test link...");
    const link = await prisma.shortLink.create({
      data: {
        slug: "test-" + Math.random().toString(36).substring(7),
        androidId: "com.test.app",
        androidName: "Test App",
      },
    });
    console.log(`Created link: ${link.slug}`);

    const fetched = await prisma.shortLink.findUnique({
      where: { slug: link.slug },
    });
    console.log(`Fetched link: ${fetched?.slug}`);

    if (fetched?.slug === link.slug) {
      console.log("Verification SUCCESSFUL!");
    } else {
      console.log("Verification FAILED!");
    }
  } catch (error) {
    console.error("Verification error:", error);
    process.exit(1);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
