import { Router } from "express";
import { generateVideoHandler, getStatusHandler } from "@controllers/video.controller";


const router = Router();

/**
 * @swagger
 * /api/video/generate:
 *   post:
 *     tags:
 *       - Video
 *     summary: Start a video generation job
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               useCase:
 *                 type: string
 *               prompt:
 *                 type: string
 *     responses:
 *       202:
 *         description: Video generation started
 *       400:
 *         description: Bad request
 */
router.post("/generate", generateVideoHandler);

/**
 * @swagger
 * /api/video/status/{operationId}:
 *   get:
 *     tags:
 *       - Video
 *     summary: Get the status of a video generation job
 *     parameters:
 *       - in: path
 *         name: operationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job status
 *       404:
 *         description: Job not found
 */
router.get("/status/:operationId", getStatusHandler);

export default router;
