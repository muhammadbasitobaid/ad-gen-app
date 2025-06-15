import { Request, Response } from "express";
import { validateVideoBody } from "@validations/video.validation";
import { getVideoJobStatus, startVideoGeneration } from "@services/video.service";

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
