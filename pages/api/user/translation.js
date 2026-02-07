import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";

import { authOptions } from "@auth/[...nextauth]";

const secret = process.env.NEXTAUTH_SECRET;

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method-not-allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "not-authenticated" });
  }

  const token = await getToken({ req, secret, raw: true });

  if (!token) {
    return res.status(401).json({ error: "no-token" });
  }

  try {
    const { verse_id, text, footnotes } = req.body;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/translation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verse_id, text, footnotes }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "user-translation-save-failed" });
  }
};
