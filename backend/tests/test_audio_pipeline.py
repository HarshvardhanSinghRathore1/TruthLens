import os
import pytest
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.services.audio_processor import audio_processor
from app.audio_detector import audio_detector
from app.schemas.analysis import AudioOutcome

def test_audio_stream_detection():
    """Verify audio stream probing detects presence/absence accurately."""
    video_no_audio = os.path.join("samples", "demo_no_face.mp4")
    video_with_audio = os.path.join("samples", "demo_video_with_audio.mp4")

    if os.path.exists(video_no_audio):
        assert audio_processor.has_audio_stream(video_no_audio) is False

    if os.path.exists(video_with_audio):
        assert audio_processor.has_audio_stream(video_with_audio) is True

def test_audio_extraction_and_cleanup():
    """Verify audio is extracted to 16kHz mono WAV and temporary files are cleaned up."""
    video_with_audio = os.path.join("samples", "demo_video_with_audio.mp4")
    if not os.path.exists(video_with_audio):
        pytest.skip("demo_video_with_audio.mp4 not found")

    success, wav_path, duration, notes = audio_processor.extract_audio_wav(video_with_audio)
    assert success is True
    assert wav_path is not None
    assert os.path.exists(wav_path)
    assert duration > 0.0

    # Test segmentation
    full_wave, segments, dur = audio_processor.load_and_segment_audio(wav_path)
    assert len(segments) >= 1
    assert isinstance(segments[0], np.ndarray)
    assert segments[0].dtype == np.float32

    # Cleanup
    audio_processor.cleanup(wav_path)
    assert not os.path.exists(wav_path)

def test_audio_detector_inference():
    """Verify pretrained Wav2Vec2 detector runs real inference on speech waveform."""
    if not audio_detector.is_loaded:
        audio_detector.load_model()

    assert audio_detector.is_loaded is True
    # 2 seconds of 16kHz waveform
    waveform = (0.5 * np.sin(2 * np.pi * 300 * np.linspace(0, 2, 32000))).astype(np.float32)
    pred = audio_detector.predict_waveform(waveform)

    assert pred["success"] is True
    assert 0.0 <= pred["spoof_score"] <= 1.0
    assert 0.0 <= pred["bonafide_score"] <= 1.0
    assert len(pred["raw_logits"]) == 2

def test_multimodal_analyze_with_audio():
    """Verify /api/analyze returns independent video and audio analysis components."""
    video_with_audio = os.path.join("samples", "demo_video_with_audio.mp4")
    if not os.path.exists(video_with_audio):
        pytest.skip("demo_video_with_audio.mp4 not found")

    with TestClient(app) as client:
        with open(video_with_audio, "rb") as f:
            resp = client.post("/api/analyze", files={"file": ("demo_video_with_audio.mp4", f, "video/mp4")})

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "completed"

        # Check video component
        assert "video_analysis" in data
        assert data["video_analysis"]["status"] == "completed"
        assert data["video_analysis"]["frames_analyzed"] > 0

        # Check audio component
        assert "audio_analysis" in data
        audio = data["audio_analysis"]
        assert audio["has_audio"] is True
        assert audio["status"] == "completed"
        assert audio["outcome"] in [
            "potentially_genuine_speech",
            "potentially_spoofed_speech",
            "unable_to_assess"
        ]
        assert audio["risk_score"] is not None
        assert 0.0 <= audio["risk_score"] <= 1.0
        assert "Wav2Vec2" in audio["model_name"]

def test_multimodal_analyze_without_audio():
    """Verify /api/analyze preserves video results when audio is missing."""
    video_no_audio = os.path.join("samples", "demo_authentic.mp4")
    if not os.path.exists(video_no_audio):
        pytest.skip("demo_authentic.mp4 not found")

    with TestClient(app) as client:
        with open(video_no_audio, "rb") as f:
            resp = client.post("/api/analyze", files={"file": ("demo_authentic.mp4", f, "video/mp4")})

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "completed"
        assert data["video_analysis"]["status"] == "completed"

        # Audio should be honestly reported as no audio detected
        assert data["audio_analysis"]["has_audio"] is False
        assert data["audio_analysis"]["status"] == "no_audio_detected"
        assert data["audio_analysis"]["outcome"] == "audio_unavailable"
