export type JobStatus = 'processing' | 'completed' | 'failed';

export interface GenerateSongRequest {
  prompt: string;
  genre: string;
  mood: string;
}

export interface GenerateSongResponse {
  jobId: string;
  status: JobStatus;
}

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  lyrics?: string;
  audioUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
