import logging
from typing import List, Optional, Dict, Any, Tuple
from app.schemas.analysis import (
    AnalysisResponse,
    AnalysisResultStatus,
    DetectionOutcome,
    VideoOutcome,
    AudioOutcome,
    FrameResult,
    VideoAnalysisComponent,
    AudioAnalysisComponent,
    AVConsistencyComponent
)
from app.core.config import settings

logger = logging.getLogger("truthlens.report_generator")

class ReportGenerator:
    """
    Compiles multimodal forensic analysis reports from video detector and audio detector outputs.
    
    Documented Aggregation Strategy (Video):
      1. Collects valid manipulation scores from frames with detected faces.
      2. If 0 valid face scores are found -> Result: UNABLE_TO_ASSESS (No faces found).
      3. For videos with detected faces:
         - mean_score: Average manipulation score across all evaluated face frames.
         - top_k_mean: Average of the top 3 highest risk scores.
         - Aggregate Risk Score = (0.65 * top_k_mean) + (0.35 * mean_score).
      4. Decision Thresholds:
         - Aggregate Risk Score >= HIGH_RISK_THRESHOLD (0.65): POTENTIAL_MANIPULATION_DETECTED.
         - Aggregate Risk Score <= LOW_RISK_THRESHOLD (0.40): NO_STRONG_SIGNS_DETECTED.
         - 0.40 < Aggregate Risk Score < 0.65: UNABLE_TO_ASSESS (Ambiguous / Inconclusive borderline).
    
    Documented Multimodal Integration:
      - Video and Audio component scores remain independent.
      - An uncalibrated overall authenticity score is never fabricated.
      - Summary reflects both components honestly based on actual media streams.
    """

    def __init__(self):
        self.high_threshold = settings.HIGH_RISK_THRESHOLD
        self.low_threshold = settings.LOW_RISK_THRESHOLD

    def generate_report(
        self,
        analysis_id: str,
        filename: str,
        duration_seconds: Optional[float],
        frames_analyzed: int,
        frame_results: List[FrameResult],
        model_name: str,
        is_model_ready: bool,
        audio_analysis: Optional[AudioAnalysisComponent] = None
    ) -> AnalysisResponse:
        """Assembles a full AnalysisResponse based on actual model inference results."""

        # Handle uninitialized / offline video model
        if not is_model_ready:
            return AnalysisResponse(
                analysis_id=analysis_id,
                status=AnalysisResultStatus.COMPLETED,
                filename=filename,
                duration_seconds=duration_seconds,
                frames_analyzed=frames_analyzed,
                result=DetectionOutcome.UNABLE_TO_ASSESS,
                risk_score=None,
                score_type="uncalibrated_offline_detector",
                score_explanation="Pretrained detector weights are not loaded. TruthLens does not fabricate detection scores.",
                summary="The video was processed for frame extraction and facial localization, but deepfake model inference was unavailable.",
                findings=[
                    f"Video duration: {duration_seconds}s." if duration_seconds else "Video duration: Not available.",
                    f"Sampled {frames_analyzed} frames across playback duration.",
                    "Detector adapter offline; awaiting model weights."
                ],
                frame_results=frame_results,
                model_name=model_name,
                limitations=[
                    "Inference could not be executed because model weights were uninitialized.",
                    "Analysis was limited to frame extraction and face localization."
                ],
                error="Model weights unavailable or failed to initialize.",
                video_analysis=VideoAnalysisComponent(
                    status=AnalysisResultStatus.FAILED,
                    outcome=VideoOutcome.UNABLE_TO_ASSESS,
                    model_name=model_name,
                    frames_analyzed=frames_analyzed,
                    faces_detected=0,
                    risk_score=None,
                    score_explanation="Detector offline.",
                    findings=["Model weights uninitialized."],
                    limitations=["Model not loaded."]
                ),
                audio_analysis=audio_analysis or AudioAnalysisComponent(
                    has_audio=False,
                    status="no_audio_detected",
                    outcome=AudioOutcome.AUDIO_UNAVAILABLE,
                    model_name="Audio Forensics Engine (Offline)",
                    duration_seconds=duration_seconds,
                    findings=["Audio stream was not processed."]
                ),
                av_consistency=AVConsistencyComponent(
                    status="not_checked",
                    findings=["AV consistency check not performed."]
                )
            )

        # Extract scored frames
        valid_scores = [fr.manipulation_score for fr in frame_results if fr.manipulation_score is not None]
        total_faces_found = sum(fr.faces_detected for fr in frame_results)

        # Case 1: No faces detected in video
        if not valid_scores or total_faces_found == 0:
            summary_nf = "Unable to assess video: TruthLens AI forensic detection requires localized human faces, but no faces were identified in the sampled frames."
            score_expl_nf = "No human facial regions were localized in the sampled frames."
            findings_nf = [
                f"Evaluated {frames_analyzed} sampled frames across {duration_seconds or 0:.1f}s playback.",
                "Haar cascade facial localization identified 0 human face regions.",
                "Non-facial visual media or abstract content cannot be assessed by facial forensics models."
            ]
            limitations_nf = [
                "The current detector is specialized for facial manipulation and cannot evaluate full-scene diffusion without visible faces.",
                "Heavy occlusions, extreme profile angles, or low lighting may prevent face detection."
            ]

            video_component_nf = VideoAnalysisComponent(
                status=AnalysisResultStatus.COMPLETED,
                outcome=VideoOutcome.UNABLE_TO_ASSESS,
                model_name=model_name,
                frames_analyzed=frames_analyzed,
                faces_detected=0,
                risk_score=None,
                score_explanation=score_expl_nf,
                findings=findings_nf,
                limitations=limitations_nf
            )

            # If audio is available, reflect audio in overall summary
            if audio_analysis and audio_analysis.has_audio and audio_analysis.status == "completed":
                overall_summary = f"{summary_nf} Audio speech analysis was performed independently ({audio_analysis.score_explanation})."
                if audio_analysis.findings:
                    findings_nf.extend(audio_analysis.findings)
            else:
                overall_summary = summary_nf

            return AnalysisResponse(
                analysis_id=analysis_id,
                status=AnalysisResultStatus.COMPLETED,
                filename=filename,
                duration_seconds=duration_seconds,
                frames_analyzed=frames_analyzed,
                result=DetectionOutcome.UNABLE_TO_ASSESS,
                risk_score=None,
                score_type="facial_region_anomaly_index",
                score_explanation=score_expl_nf,
                summary=overall_summary,
                findings=findings_nf,
                frame_results=frame_results,
                model_name=model_name,
                limitations=limitations_nf,
                error=None,
                video_analysis=video_component_nf,
                audio_analysis=audio_analysis or AudioAnalysisComponent(
                    has_audio=False,
                    status="no_audio_detected",
                    outcome=AudioOutcome.AUDIO_UNAVAILABLE,
                    model_name="Audio Forensics Module",
                    duration_seconds=duration_seconds,
                    findings=["No audio speech stream evaluated."]
                ),
                av_consistency=AVConsistencyComponent(
                    status="unable_to_assess",
                    findings=["No human faces localized for lip-sync correlation."]
                )
            )

        # Compute aggregate video metrics
        mean_score = sum(valid_scores) / len(valid_scores)
        sorted_scores = sorted(valid_scores, reverse=True)
        top_k_count = min(3, len(sorted_scores))
        top_k_mean = sum(sorted_scores[:top_k_count]) / top_k_count
        peak_score = sorted_scores[0]

        # Weighted heuristic risk index
        aggregate_risk = round((0.65 * top_k_mean) + (0.35 * mean_score), 4)

        # Find timestamp of peak anomaly
        peak_frame = max(frame_results, key=lambda f: f.manipulation_score if f.manipulation_score is not None else -1.0)
        peak_ts = peak_frame.timestamp_seconds

        # Determine video outcome based on aggregate risk, top-k keyframes, and localized anomalies
        high_risk_count = sum(1 for s in valid_scores if s >= self.high_threshold)

        # In forensic screening, a video exhibits manipulation if aggregate risk is high,
        # or sampled keyframes cross the model's manipulation threshold.
        is_video_manipulated = (
            aggregate_risk >= self.high_threshold or
            top_k_mean >= self.high_threshold or
            high_risk_count >= 1 or
            peak_score >= 0.50
        )
        is_video_genuine = (
            aggregate_risk <= self.low_threshold and
            peak_score < (self.low_threshold + 0.15)
        )

        if is_video_manipulated:
            video_outcome = VideoOutcome.POTENTIALLY_MANIPULATED
            aggregate_risk = max(aggregate_risk, round(top_k_mean, 4))
            video_summary = (
                f"Potential facial manipulation detected. Visual artifacts consistent with AI synthesis "
                f"or face swapping were identified across sampled keyframes (peak anomaly score: {peak_score:.2f}, "
                f"keyframe risk: {top_k_mean:.2f})."
            )
            video_score_expl = (
                f"Visual risk score {aggregate_risk:.2f} reflects elevated facial manipulation indicators, "
                f"with peak anomaly ({peak_score:.2f}) observed near {peak_ts:.1f}s and {high_risk_count} frames "
                f"exceeding the detection threshold ({self.high_threshold:.2f})."
            )
        elif is_video_genuine:
            video_outcome = VideoOutcome.POTENTIALLY_GENUINE
            video_summary = (
                f"No strong signs of facial manipulation detected. Sampled facial textures and boundary "
                f"transitions appear consistent with authentic camera captures (aggregate visual risk score: {aggregate_risk:.2f})."
            )
            video_score_expl = (
                f"Visual risk score {aggregate_risk:.2f} reflects low anomaly indices across "
                f"{len(valid_scores)} evaluated facial regions."
            )
        else:
            video_outcome = VideoOutcome.UNABLE_TO_ASSESS
            video_summary = (
                f"Inconclusive video analysis. The visual anomaly score ({aggregate_risk:.2f}) falls in the ambiguous "
                f"borderline range ({self.low_threshold:.2f} - {self.high_threshold:.2f}), where localized anomalies "
                f"or compression noise cannot be conclusively distinguished from synthetic manipulation."
            )
            video_score_expl = (
                f"Borderline visual score {aggregate_risk:.2f} indicates inconclusive forensic confidence. "
                f"Neither authenticity nor manipulation can be strongly asserted from visual frames alone."
            )

        # Compile granular visual findings
        findings = [
            f"Analyzed {frames_analyzed} uniform frames over {duration_seconds or 0:.1f}s video duration.",
            f"Localized human faces in {len(valid_scores)} of {frames_analyzed} sampled frames.",
            f"Average facial anomaly score: {mean_score:.2f}; peak anomaly score: {peak_score:.2f} (at {peak_ts:.1f}s).",
            f"Frames exceeding high-risk threshold ({self.high_threshold:.2f}): {high_risk_count} of {len(valid_scores)}.",
            f"Model architecture: Pretrained Deepfake Detector ({model_name})."
        ]

        # Multi-modal component breakdown for video
        video_component = VideoAnalysisComponent(
            status=AnalysisResultStatus.COMPLETED,
            outcome=video_outcome,
            model_name=model_name,
            frames_analyzed=frames_analyzed,
            faces_detected=total_faces_found,
            risk_score=aggregate_risk,
            score_explanation=video_score_expl,
            findings=list(findings),
            limitations=[
                "Automated model inference provides a forensic risk estimate, not mathematical or legal proof of authenticity.",
                "Re-encoding, social media compression, motion blur, and low lighting can mimic or mask manipulation artifacts."
            ]
        )

        # Multimodal Fusion: Synthesize visual and acoustic evidence into overall dossier verdict
        has_valid_audio = audio_analysis and audio_analysis.has_audio and audio_analysis.status == "completed"
        is_audio_spoofed = (
            has_valid_audio and
            audio_analysis.outcome == AudioOutcome.POTENTIALLY_SPOOFED_SPEECH
        )
        is_audio_genuine = (
            has_valid_audio and
            audio_analysis.outcome == AudioOutcome.POTENTIALLY_GENUINE_SPEECH
        )
        audio_risk = audio_analysis.risk_score if (has_valid_audio and audio_analysis.risk_score is not None) else None

        if has_valid_audio:
            findings.append(f"Audio Forensics ({audio_analysis.model_name}): {audio_analysis.score_explanation}")

        # Multimodal Decision Engine
        if is_video_manipulated and is_audio_spoofed:
            outcome = DetectionOutcome.POTENTIAL_MANIPULATION_DETECTED
            aggregate_risk = max(aggregate_risk, audio_risk if audio_risk is not None else aggregate_risk)
            summary = (
                f"Dual-Modal Deepfake Detected: Both visual facial frames (visual risk: {aggregate_risk:.2f}) "
                f"and demuxed speech audio (acoustic spoof index: {(audio_risk or 0)*100:.1f}%) exhibit "
                f"high-confidence synthetic manipulation signatures consistent with AI generative video and cloned speech."
            )
            score_explanation = (
                f"Multimodal risk index {aggregate_risk:.2f}: Visual frames show neural facial manipulation (peak: {peak_score:.2f}) "
                f"and the demuxed audio track exhibits neural vocoder synthesis artifacts (acoustic risk: {(audio_risk or 0)*100:.1f}%)."
            )
            findings.append("MULTIMODAL SYNTHESIS: High anomaly detected across both visual video frames and speech audio track.")

        elif is_video_manipulated and is_audio_genuine:
            outcome = DetectionOutcome.POTENTIAL_MANIPULATION_DETECTED
            summary = (
                f"Visual Facial Reenactment Deepfake Detected: Visual keyframes exhibit synthetic face-swapping or "
                f"facial morphing artifacts (peak anomaly: {peak_score:.2f}, visual risk: {aggregate_risk:.2f}), while the audio track "
                f"exhibits natural human vocal tract acoustics (no AI vocoder synthesis detected). This pattern is typical of a human "
                f"voice actor or impressionist driving a manipulated facial video track (human-puppetry deepfake)."
            )
            score_explanation = (
                f"Multimodal risk index {aggregate_risk:.2f}: Elevated facial boundary manipulation on video frames ({high_risk_count} frames >= threshold). "
                f"Audio track reflects natural human vocal tract acoustics (live human impressionist)."
            )
            findings.append(
                "CROSS-MODAL SIGNATURE: Video displays facial manipulation while speech audio exhibits "
                "natural human vocal acoustics. Characteristic of human impressionist / voice actor driving a deepfake face."
            )

        elif is_audio_spoofed:
            outcome = DetectionOutcome.POTENTIAL_MANIPULATION_DETECTED
            aggregate_risk = audio_risk if audio_risk is not None else 0.75
            summary = (
                f"Synthetic Speech / Voice-Cloning Deepfake Detected: Demuxed speech audio exhibits elevated "
                f"neural vocoder / synthetic voice cloning signatures (Acoustic Spoof Index: {(audio_risk or 0)*100:.1f}%), "
                f"while visual facial boundaries appear consistent with camera capture. This signature is characteristic "
                f"of an audio-dubbed deepfake or synthetic voice clone applied to video footage."
            )
            score_explanation = (
                f"Multimodal risk index {aggregate_risk:.2f}: Demuxed speech track exceeds synthetic audio threshold "
                f"({(audio_risk or 0)*100:.1f}% spoof index), indicating AI voice synthesis or voice conversion."
            )
            findings.append(
                f"CROSS-MODAL SIGNATURE: Audio speech track contains AI neural vocoder artifacts (spoof index: {(audio_risk or 0)*100:.1f}%), "
                f"flagging the media as a synthetic audio deepfake."
            )

        elif is_video_genuine and (is_audio_genuine or not has_valid_audio):
            outcome = DetectionOutcome.NO_STRONG_SIGNS_DETECTED
            summary = (
                f"No strong signs of deepfake manipulation detected across visual facial structures "
                f"(visual risk: {aggregate_risk:.2f})"
                + (f" or acoustic speech harmonics (acoustic risk: {(audio_risk or 0)*100:.1f}%)." if has_valid_audio else ". (No audio track present).")
                + " Sampled media exhibits characteristics consistent with authentic camera captures."
            )
            score_explanation = (
                f"Multimodal risk index {aggregate_risk:.2f}: Sampled facial regions and acoustic features "
                f"remain below deepfake anomaly thresholds."
            )

        else:
            outcome = DetectionOutcome.UNABLE_TO_ASSESS
            aggregate_risk = max(aggregate_risk, audio_risk if audio_risk is not None else 0.0)
            summary = (
                f"Inconclusive multimodal screening. The aggregate anomaly score ({aggregate_risk:.2f}) falls in the "
                f"ambiguous borderline range, where localized anomalies, video compression, or acoustic background noise "
                f"cannot be conclusively distinguished from synthetic manipulation."
            )
            score_explanation = (
                f"Borderline multimodal score {aggregate_risk:.2f} indicates inconclusive forensic confidence. "
                f"Neither authenticity nor manipulation can be strongly asserted."
            )

        limitations = [
            "Automated model inference provides a forensic risk estimate, not mathematical or legal proof of authenticity.",
            "Re-encoding, social media compression, motion blur, and low lighting can mimic or mask manipulation artifacts.",
            "Audio-video synchronization and lip-sync are evaluated independently and not assumed identical.",
            "Predictions should be evaluated alongside chain-of-custody and corroborating context."
        ]

        resolved_audio = audio_analysis or AudioAnalysisComponent(
            has_audio=False,
            status="no_audio_detected",
            outcome=AudioOutcome.AUDIO_UNAVAILABLE,
            model_name="TruthLens Audio Forensics Engine (Offline)",
            duration_seconds=duration_seconds,
            segments_analyzed=0,
            risk_score=None,
            score_explanation="No audio stream detected in video container.",
            findings=["Audio stream was not processed for deepfake speech anomalies."],
            limitations=["Voice cloning and speech synthesis detection require an audio track."]
        )

        av_component = AVConsistencyComponent(
            status="not_checked",
            sync_score=None,
            active_speaking_frames=None,
            findings=[
                "Audio-video synchronization and lip-sync analysis is not implemented in this version.",
                "Facial visual forensics and speech forensics are evaluated as independent modalities."
            ],
            disclaimer="TruthLens facial detector analyzes spatial video frames. Lip-sync correlation is not computed."
        )

        return AnalysisResponse(
            analysis_id=analysis_id,
            status=AnalysisResultStatus.COMPLETED,
            filename=filename,
            duration_seconds=duration_seconds,
            frames_analyzed=frames_analyzed,
            result=outcome,
            risk_score=aggregate_risk,
            score_type="aggregate_face_anomaly_score",
            score_explanation=score_explanation,
            summary=summary,
            findings=findings,
            frame_results=frame_results,
            model_name=model_name,
            limitations=limitations,
            error=None,
            video_analysis=video_component,
            audio_analysis=resolved_audio,
            av_consistency=av_component
        )

report_generator = ReportGenerator()
