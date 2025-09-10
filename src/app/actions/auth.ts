import { prisma } from "@/lib/Prisma";

export const saveSignIn = async (email: string, name: string): Promise<any> => {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        let newUser;
        if (!user) {
            newUser = await prisma.user.create({
                data: { email, name },
            });
        }

        return newUser || user;
    } catch (error: any) {
        console.error("Error in saveSignIn:", error);

        // Handle prepared statement conflicts by disconnecting and reconnecting
        if (error.code === 'P2028' || error.message?.includes('prepared statement')) {
            try {
                await prisma.$disconnect();
                // Wait a bit before reconnecting
                await new Promise(resolve => setTimeout(resolve, 100));
                // Retry the operation
                return await saveSignIn(email, name);
            } catch (retryError) {
                console.error("Retry failed:", retryError);
                return null;
            }
        }

        return null;
    }
}
