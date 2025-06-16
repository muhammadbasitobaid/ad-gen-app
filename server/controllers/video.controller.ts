import { Request, Response } from "express";
import { startVideoGeneration, getVideoJobStatus, getAllVideoJobs } from "@services/video.service";
import { validateVideoBody } from "@validations/video.validation";
import fs from "fs";
import path from "path";

export const generateVideoHandler = async (req: Request, res: Response) => {
  const { error } = validateVideoBody(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { useCase, prompt } = req.body;

  try {
    const newRequest = await startVideoGeneration(useCase, prompt);

    res.status(202).json({
      message: "Video generation started.",
      operationId: newRequest.operationId,
      statusUrl: `/api/video/status/${newRequest.operationId}`,
    });
  } catch (error: any) {
    console.error("Failed to start video generation job:", error);
    res.status(500).json({ error: "Failed to start video generation job", details: error.message });
  }
};

export const getStatusHandler = async (req: Request, res: Response) => {
  const { operationId } = req.params;
  const request = await getVideoJobStatus(operationId);

  if (!request) {
    return res.status(404).json({ error: "Job not found." });
  }

  res.json({
    operationId: request.operationId,
    status: request.status,
    videoUrl: request.videoUrl,
    createdAt: request.createdAt,
  });
};

export const streamVideoHandler = async (req: Request, res: Response) => {
  const { filename } = req.params;
  console.log(filename);
  const videoPath = path.join(process.cwd(), 'public/videos', filename);
  console.log(videoPath);
  console.log(fs.existsSync(videoPath));

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: "Video not found." });
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
};

export const getAllJobsHandler = async (req: Request, res: Response) => {
  try {
    const jobs = await getAllVideoJobs();
    res.json(jobs);
  } catch (error: any) {
    console.error("Failed to fetch video generation jobs:", error);
    res.status(500).json({ error: "Failed to fetch video generation jobs", details: error.message });
  }
};

export const downloadVideoHandler = async (req: Request, res: Response) => {
  const { filename } = req.params;
  const videoPath = path.join(process.cwd(), 'public/videos', filename);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: "Video not found." });
  }

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'video/mp4');

  fs.createReadStream(videoPath).pipe(res);
};
