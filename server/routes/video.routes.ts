import { Router } from "express";
import {
  generateVideoHandler,
  getStatusHandler,
  streamVideoHandler,
  getAllJobsHandler,
  downloadVideoHandler,
} from "@controllers/video.controller";


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

/*curl http://localhost:8081/api/video/stream/1ba1c1e6-8d7f-4be4-b747-d2f19ae5d187.mp4 -o downloaded_video.mp4*
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

/**
 * @swagger
 * /api/video/stream/{filename}:
 *   get:
 *     tags:
 *       - Video
 *     summary: Stream a video file
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video stream
 *       404:
 *         description: Video not found
 */
router.get("/stream/:filename", streamVideoHandler);

/**
 * @swagger
 * /api/video/jobs:
 *   get:
 *     tags:
 *       - Video
 *     summary: Get a list of all video generation jobs
 *     responses:
 *       200:
 *         description: A list of jobs
 *       500:
 *         description: Server error
 */
router.get("/jobs", getAllJobsHandler);

/**
 * @swagger
 * /api/video/download/{filename}:
 *   get:
 *     tags:
 *       - Video
 *     summary: Download a video file
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video file
 *       404:
 *         description: Video not found
 */
router.get("/download/:filename", downloadVideoHandler);

export default router;
