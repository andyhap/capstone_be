import prisma from "../utils/prisma.js";

const ok = (res, msg, data) => res.status(200).json({ success: true, message: msg, data });
const fail = (res, code, msg) => res.status(code).json({ success: false, message: msg });

// FOLLOW ARTIST
export const followArtist = async (req, res) => {
    try {
        const userId = req.user.id;
        const artistId = Number(req.params.artistId);

        const exists = await prisma.followingArtist.findFirst({
            where: { userId, artistId }
        });

        if (exists) return fail(res, 400, "Already following this artist");

        await prisma.followingArtist.create({
            data: { userId, artistId }
        });

        await prisma.artist.update({
            where: { id: artistId },
            data: { followers: { increment: 1 } }
        });

        return ok(res, "Artist followed");
    } catch (err) {
        return fail(res, 500, err.message);
    }
};

// UNFOLLOW ARTIST
export const unfollowArtist = async (req, res) => {
    try {
        const userId = req.user.id;
        const artistId = Number(req.params.artistId);

        await prisma.followingArtist.deleteMany({
            where: { userId, artistId }
        });

        await prisma.artist.update({
            where: { id: artistId },
            data: { followers: { decrement: 1 } }
        });

        return ok(res, "Artist unfollowed");
    } catch (err) {
        return fail(res, 500, err.message);
    }
};

// LIST FOLLOWED ARTISTS
export const getFollowingArtists = async (req, res) => {
    try {
        const userId = req.user.id;

        const data = await prisma.followingArtist.findMany({
            where: { userId },
            include: { artist: true }
        });

        return ok(res, "Following list fetched", data);
    } catch (err) {
        return fail(res, 500, err.message);
    }
};
