Zydoc Frontend — S3 Compatibility Implementation Plan
Purpose
Update the existing Zydoc frontend only as needed to work with the backend's approved S3/CloudFront implementation. This is the frontend plan and source of truth for frontend implementation chats.
Confirmed setup
- Frontend: Next.js 14.2.35 with TypeScript and App Router.
- Public doctor images will be served through CloudFront:
  https://d2j3r11t01prca.cloudfront.net
- Private files must be accessed through the backend's authorized flow and short-lived URLs.
- Backend AWS/S3 SDK packages and environment configuration are handled in the backend project. Do not add AWS SDK packages to the frontend.
- Frontend .env is not a place for AWS access keys. Never expose AWS credentials in NEXT_PUBLIC_* variables.
Non-negotiable constraints
1. Inspect the actual frontend repository and the backend's implemented API contracts before changing code.
2. Preserve existing routes, screens, UI, request payloads, response handling, form validation, Redux behavior, and user flows except for the smallest necessary compatibility changes.
3. Do not refactor unrelated components or rename APIs.
4. Do not put AWS access keys, secret keys, private bucket names/keys, or private presigned URLs into persistent frontend state, logs, analytics, or local storage.
5. Public CloudFront URLs are appropriate only for assets intentionally public. Never render a private medical/identity/verification file using a public CloudFront URL.
6. Do not assume all file URLs are relative. Handle absolute http(s) URLs and legacy relative paths safely, according to the actual backend response contract.
7. Do not construct unsafe URLs from untrusted user-controlled strings. Validate expected schemes and origins where appropriate.
8. Add only the exact CloudFront hostname to Next.js image configuration if required. Do not allow *.amazonaws.com broadly without a demonstrated need.
9. Do not modify backend code from a frontend implementation chat.
10. Each phase must be small, tested, and reviewed before proceeding.
Existing frontend areas identified by initial audit — verify against current source
- next.config.mjs: allow the exact CloudFront hostname for Next.js image loading, if needed.
- src/components/layout/Sidebar.tsx: avatar URL handling.
- src/components/layout/Topbar.tsx: avatar URL handling.
- src/app/patient/(protected)/records/page.tsx: medical-record file URL handling.
- src/app/patient/(protected)/appointments/page.tsx: dispute-proof UI/request contract.
- Search the whole frontend for /uploads/, avatarUrl, fileUrl, medicalCertificateUrl, governmentIdUrl, consultationFiles, disputeProofUrl, proofUrl, and any URL concatenation using the backend base URL.
These are starting points only. Verify all actual usages before edits.
Expected behavior
- Public doctor image: render the backend-provided CloudFront URL or compatible legacy URL without prepending the backend API base to an already absolute URL.
- Private file: call the existing backend endpoint/flow that performs authorization and returns a short-lived URL or streams the file. Do not attempt to access the private S3 bucket directly from the browser.
- Legacy relative URL: keep compatibility only if the backend still supports it; build the URL using the configured backend base URL safely.
- Dispute proof: make the existing UI and request payload match the actual backend contract. Do not silently change a link-input feature into a file-upload feature, or vice versa, without confirming intended behavior and backend support.
- Images: only public images should use Next.js remote-image configuration. If a private image requires a temporary URL, confirm that the current image component/config supports it safely and avoid broad host allowlists.
Phase-by-phase execution
Phase F0 — Repository inspection and backend contract review (no code changes)
1. Read this plan and inspect the frontend repository.
2. Review the backend's actual implemented response formats and endpoints from its code or an approved backend phase report. Do not assume backend changes have already landed.
3. Search all frontend uses of file URLs, avatars, medical records, consultation files, doctor certificates, and dispute proof.
4. Identify exact files and minimal changes required.
5. Do not edit application code, .env, UI, or API calls yet.
6. Report findings and stop for approval.
Phase F1 — URL compatibility helper (only if needed)
1. Determine whether a small shared helper is genuinely needed. Do not add an abstraction if a few direct, clear changes suffice.
2. Ensure absolute HTTP(S) URLs are not prefixed with the backend base URL.
3. Resolve legacy relative /uploads/... URLs only where the backend continues to support them.
4. Reject or safely handle unexpected URL schemes.
5. Add focused tests if the project already has an appropriate test setup.
6. Do not change page UI or API payloads in this phase. Stop for review.
Phase F2 — Public image compatibility
1. Update the exact Next.js image hostname configuration if required for d2j3r11t01prca.cloudfront.net.
2. Update avatar/profile-image URL handling in identified components.
3. Preserve fallbacks, loading behavior, current layouts, and existing image dimensions.
4. Do not expose pending-doctor images or private document URLs through public image paths.
5. Run TypeScript and relevant build/checks. Stop for review.
Phase F3 — Private medical-record and consultation-file access
1. Align file-opening/download behavior with the backend's actual authorized endpoint/response contract.
2. Do not use permanent public URLs for private files.
3. Do not store presigned URLs as durable profile/record state; request a fresh URL when needed according to the backend flow.
4. Preserve current screen design and existing access-denied/error behavior as much as possible.
5. Verify the user cannot access another patient's records by changing a URL or identifier.
6. Stop for review.
Phase F4 — Dispute proof contract alignment
1. Inspect the current dispute-proof UI and actual backend request/response contract.
2. Confirm whether the product flow accepts a file upload, an external proof link, or both.
3. Make the smallest compatible change; coordinate a backend change only through a separate approved backend phase.
4. Preserve existing appointment/dispute behavior and validation.
5. Test valid submission, invalid input, authorization failures, and error states. Stop for review.
Phase F5 — Remaining URL consumers and final verification
1. Search again for all legacy /uploads/ references and all file URL concatenation.
2. Check doctor profile/verification views, patient avatar, records, consultation attachments, and dispute proof.
3. Verify private links are not logged or persisted unnecessarily.
4. Run npx tsc --noEmit, production build, and relevant frontend tests.
5. Report exact commands/results and stop for review.
Required report after every phase
- Phase completed and scope.
- Files changed and why.
- API/request/response contract impact (explicitly say “none” if none).
- Confirmation that AWS secrets were not added to frontend code or environment variables.
- Tests/commands run and exact results.
- Known limitations or unresolved backend dependencies.
- Stop and wait for approval before the next phase.
Definition of done
- Public doctor images display correctly through CloudFront.
- Private files are accessed only through the backend's authorized flow.
- Absolute URLs are not incorrectly prefixed with the API base URL.
- Legacy relative URLs work only where intentionally supported.
- Dispute-proof UI matches the actual backend contract.
- No AWS credentials or private file links are exposed unnecessarily.
- TypeScript/build and relevant tests pass.