/**
 * ladybug.tsx — retired (giba, 2026-07-11: "remove the ladybug from the footer").
 *
 * The footer ladybug is gone. Every prior incarnation survives in the artifact
 * version history if it's ever wanted back:
 *   `pip-footer-ladybug`   — v1 code character (SVG + behavior brain)
 *   `pip-3d-flight`        — v1.1 with 3D spline flights
 *   `pip-v2-bar-resident`  — v2 bar-resident sculpt, 14 acts (spec:
 *                            ~/.gstack/projects/giba/pip-bar-v2-design-handoff-20260711.md)
 *   `pip-v3-film`          — keyed reference-video version
 *
 * The export stays (as a null component) because FieldFooter may still mount
 * <Pip /> in some working copies of App.tsx — this file is edited by more than
 * one session, and a null render is the collision-proof way to guarantee
 * "removed" no matter whose App.tsx wins.
 */
export function Pip() {
  return null
}
