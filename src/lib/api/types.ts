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

export interface HistorySong {
  id: string;
  job_id: string;
  lyrics: string;
  prompt: string;
  genre?: string;
  mood?: string;
  tempo?: string;
  status: JobStatus;
  error?: string;
  created_at: string;
  updated_at: string;
  audioUrl?: string;
}

export interface DeleteSongResponse {
  success: boolean;
}
