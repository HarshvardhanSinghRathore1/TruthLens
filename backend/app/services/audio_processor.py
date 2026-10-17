import os
import subprocess
import logging
import uuid
import numpy as np
import scipy.io.wavfile as wavfile
from typing import Tuple, Optional, List, Dict, Any
import imageio_ffmpeg

from app.core.config import settings

logger = logging.getLogger("truthlens.audio_processor")

class AudioProcessor:
    """
    Handles audio stream probing, FFmpeg extraction to 16kHz mono WAV,
    waveform validation, and segmentation for deepfake speech detection.
    """

    def __init__(self):
        self.ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        self.target_sr = settings.AUDIO_SAMPLE_RATE
        self.segment_sec = settings.AUDIO_SEGMENT_DURATION_SEC
        self.max_duration_sec = settings.AUDIO_MAX_DURATION_SEC

    def has_audio_stream(self, video_path: str) -> bool:
        """Checks whether the media container contains an audio stream using FFmpeg probe."""
        if not os.path.exists(video_path):
            return False

        try:
            # Run ffmpeg probe without decoding
            cmd = [self.ffmpeg_exe, "-i", video_path]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            return "Audio:" in res.stderr
        except Exception as e:
            logger.warning(f"Error checking audio stream in {video_path}: {e}")
            return False

    def extract_audio_wav(self, video_path: str) -> Tuple[bool, Optional[str], float, Optional[str]]:
        """
        Extracts the audio track from the input video file to a 16kHz mono PCM16 WAV.
        Returns: (success, wav_path, duration_seconds, error_or_notes)
        """
        if not self.has_audio_stream(video_path):
            return False, None, 0.0, "Media container contains no audio stream."

        temp_id = uuid.uuid4().hex[:10]
        out_wav = os.path.join(settings.UPLOAD_DIR, f"audio_{temp_id}.wav")
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

        try:
            cmd = [
                self.ffmpeg_exe,
                "-y",
                "-i", video_path,
                "-vn",
                "-acodec", "pcm_s16le",
                "-ar", str(self.target_sr),
                "-ac", "1",
                "-t", str(self.max_duration_sec),
                out_wav
            ]
            
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if res.returncode != 0 or not os.path.exists(out_wav):
                err = res.stderr.strip() if res.stderr else "FFmpeg extraction failed."
                logger.warning(f"FFmpeg audio extraction error: {err}")
                return False, None, 0.0, f"FFmpeg extraction failed: {err}"

            file_size = os.path.getsize(out_wav)
            if file_size < 100:
                self.cleanup(out_wav)
                return False, None, 0.0, "Extracted audio file is empty (0 bytes)."

            # Read audio file to determine duration and validate waveform
            sr, data = wavfile.read(out_wav)
            duration = len(data) / float(sr) if sr > 0 else 0.0

            if duration < 0.3:
                self.cleanup(out_wav)
                return False, None, duration, "Extracted audio clip is too short for speech forensics (< 0.3s)."

            # Check for silent audio (RMS threshold)
            float_wave = data.astype(np.float32) / 32768.0
            rms = np.sqrt(np.mean(float_wave ** 2))
            if rms < 1e-4:
                logger.info(f"Audio track in {video_path} is near-silent (RMS: {rms:.6f})")
                return True, out_wav, round(duration, 2), "near_silent"

            logger.info(f"Successfully extracted {duration:.2f}s audio from {video_path} to {out_wav}")
            return True, out_wav, round(duration, 2), None

        except subprocess.TimeoutExpired:
            self.cleanup(out_wav)
            return False, None, 0.0, "FFmpeg audio extraction timed out."
        except Exception as e:
            self.cleanup(out_wav)
            logger.error(f"Unexpected audio extraction failure: {e}", exc_info=True)
            return False, None, 0.0, str(e)

    def load_and_segment_audio(self, wav_path: str) -> Tuple[np.ndarray, List[np.ndarray], float]:
        """
        Loads the WAV file as float32 in [-1.0, 1.0] and segments it into chunks of
        AUDIO_SEGMENT_DURATION_SEC (e.g. 5.0 seconds / 80000 samples at 16kHz).
        Returns: (full_waveform, list_of_segments, duration_seconds)
        """
        sr, data = wavfile.read(wav_path)
        float_wave = data.astype(np.float32) / 32768.0
        duration = len(float_wave) / float(sr)

        segment_samples = int(self.segment_sec * self.target_sr)
        
        # If shorter than one segment, evaluate as single segment
        if len(float_wave) <= segment_samples:
            return float_wave, [float_wave], duration

        # Slice into non-overlapping segments
        segments = []
        for start_idx in range(0, len(float_wave), segment_samples):
            chunk = float_wave[start_idx:start_idx + segment_samples]
            # Discard trailing slivers shorter than 0.5 seconds
            if len(chunk) >= int(0.5 * self.target_sr):
                segments.append(chunk)

        if not segments:
            segments = [float_wave[:segment_samples]]

        return float_wave, segments, duration

    def cleanup(self, file_path: Optional[str]):
        """Safely removes temporary audio file from disk."""
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError as e:
                logger.warning(f"Could not remove temporary audio file {file_path}: {e}")

audio_processor = AudioProcessor()
