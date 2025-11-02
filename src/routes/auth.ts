import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma/client/index.js";
import redis from "../redis/client.ts";

const prisma = new PrismaClient();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });
  res.json(user);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return res.status(400).json({ message: "Invalid credentials" });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
  await redis.set(`token:${user.id}`, token, "EX", 3600);
  res.json({ token });
});

router.post("/logout", async (req, res) => {
  const { userId } = req.body;
  await redis.del(`token:${userId}`);
  res.json({ message: "Logged out successfully" });
});

export default router;
