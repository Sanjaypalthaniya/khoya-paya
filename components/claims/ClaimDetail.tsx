"use client";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
type Question = {
  id: string;
  questionText: string;
  answerType: string;
  isRequired: boolean;
  answer: string | null;
  reviewStatus: string | null;
};
type Detail = {
  id: string;
  publicClaimId: string;
  claimType: string;
  status: string;
  post: {
    title: string;
    itemCategory: string;
    publicLocationName: string | null;
    city: string | null;
  };
  requester: { id: string; name: string };
  recipient: { id: string; name: string };
  publicMessage: string;
  privateMessage: string | null;
  questions: Question[];
  evidence: Array<{
    id: string;
    evidenceType: string;
    url: string;
    moderationStatus: string;
  }>;
  timeline: Array<{
    id: string;
    title: string;
    description: string;
    createdAt: string;
  }>;
  returnArrangement: {
    status: string;
    approximatePlace: string;
    scheduledAt: string;
    requesterConfirmed: boolean;
    recipientConfirmed: boolean;
  } | null;
  reward: { status: string; amount: string | null; currency: string } | null;
  disputes: Array<{ publicDisputeId: string; reason: string; status: string }>;
  successConsent: unknown;
  nextAction: string;
  secureConversationUrl: string | null;
};
async function jsonAction(
  url: string,
  body: unknown = { reason: "User confirmed this recovery step." },
) {
  const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "Action failed.");
  return payload;
}
export default function ClaimDetail({ claimId }: { claimId: string }) {
  const [data, setData] = useState<Detail | null>(null),
    [answers, setAnswers] = useState<Record<string, string>>({}),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [handoverCode, setHandoverCode] = useState("");
  const load = useCallback(async () => {
    const response = await fetch(`/api/claims/${claimId}`, {
        cache: "no-store",
      }),
      body = await response.json();
    if (!response.ok) throw new Error(body.message || "Unable to load claim.");
    setData(body.data);
  }, [claimId]);
  useEffect(() => {
    const task = window.setTimeout(
      () => void load().catch((cause) => setError(cause.message)),
      0,
    );
    return () => window.clearTimeout(task);
  }, [load]);
  async function act(path: string, body?: unknown) {
    setBusy(true);
    setError("");
    try {
      const result = await jsonAction(`/api/claims/${claimId}/${path}`, body);
      setNotice(result.message);
      if (result.data?.code) setHandoverCode(result.data.code);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }
  async function submitAnswers(event: FormEvent) {
    event.preventDefault();
    await act("answers", {
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
    });
  }
  async function uploadEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const form = new FormData(event.currentTarget),
        response = await fetch(`/api/claims/${claimId}/evidence`, {
          method: "POST",
          body: form,
        }),
        body = await response.json();
      if (!response.ok) throw new Error(body.message);
      setNotice(body.message);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  if (error && !data) return <div className="claims-state claims-state-error" role="alert"><h3>Unable to open this case</h3><p>{error}</p></div>;
  if (!data) return <div className="claims-detail-loading"><span aria-hidden="true" /><p>Loading your private recovery case…</p></div>;
  return (
    <div className="claim-detail">
      <div className="claim-detail-main">
        <header className="claim-detail-heading">
        <Link href="/dashboard/claims">← Back to all cases</Link>
        <span className="claim-status">{data.status.replaceAll("_", " ")}</span>
        <h2>{data.post.title}</h2>
        <p>
          {data.publicClaimId} · {data.claimType.replaceAll("_", " ")}
        </p>
        </header>
        <article className="dashboard-message-card">
          <h2>Claim summary</h2>
          <p>{data.publicMessage}</p>
          {data.privateMessage && (
            <p>
              <strong>Private context:</strong> {data.privateMessage}
            </p>
          )}
          <p>
            Participants: {data.requester.name} and {data.recipient.name}
          </p>
          {data.secureConversationUrl && (
            <Link className="btn btn-secondary-kp" href={data.secureConversationUrl}>
              Open secure conversation
            </Link>
          )}
        </article>
        <article className="dashboard-message-card">
          <h2>Private verification</h2>
          <p>
            Never enter passwords, PINs, OTPs, full identity numbers, or banking
            credentials.
          </p>
          <form onSubmit={submitAnswers}>
            {data.questions.map((question) => (
              <label key={question.id}>
                {question.questionText}
                <textarea
                  required={question.isRequired}
                  maxLength={2000}
                  value={answers[question.id] ?? question.answer ?? ""}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))
                  }
                />
                <small>{question.reviewStatus ?? "Not answered"}</small>
                {question.answer && question.reviewStatus !== "ACCEPTED" && (
                  <button
                    type="button"
                    onClick={() =>
                      act("answers/review", {
                        reviews: [
                          {
                            questionId: question.id,
                            status: "ACCEPTED",
                            score: 100,
                          },
                        ],
                      })
                    }
                  >
                    Accept answer
                  </button>
                )}
              </label>
            ))}
            <button disabled={busy || !data.questions.length}>
              Submit encrypted answers
            </button>
          </form>
        </article>
        <article className="dashboard-message-card">
          <h2>Supporting evidence</h2>
          <p>
            Hide account numbers, complete identity numbers, passwords, PINs and
            financial details before uploading.
          </p>
          <form onSubmit={uploadEvidence}>
            <input type="hidden" name="evidenceType" value="IMAGE" />
            <input
              required
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
            />
            <textarea
              name="description"
              maxLength={500}
              placeholder="Describe this masked proof"
            />
            <button disabled={busy}>Upload privately</button>
          </form>
          {data.evidence.map((e) => (
            <p key={e.id}>
              <a href={e.url} target="_blank">
                {e.evidenceType}
              </a>{" "}
              · {e.moderationStatus}
            </p>
          ))}
        </article>
        <article className="dashboard-message-card">
          <h2>Recovery timeline</h2>
          {data.timeline.map((item) => (
            <div key={item.id}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              <small>{new Date(item.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </article>
      </div>
      <aside className="claim-detail-aside">
        <div
          className="dashboard-message-card claim-action-panel"
        >
          <span className="status-pill">{data.status}</span>
          <h2>Next action</h2>
          <p>{data.nextAction}</p>
          {[
            "SUBMITTED",
            "UNDER_REVIEW",
            "VERIFICATION_PENDING",
            "NEEDS_MORE_INFORMATION",
          ].includes(data.status) && (
            <>
              <button
                disabled={busy}
                onClick={() =>
                  act("approve", {
                    reason: "Ownership evidence reviewed and accepted.",
                  })
                }
              >
                Approve claim
              </button>
              <button
                disabled={busy}
                onClick={() =>
                  act("request-more-info", {
                    reason: "Additional private verification is required.",
                  })
                }
              >
                Request more information
              </button>
              <button
                disabled={busy}
                onClick={() =>
                  act("reject", {
                    reason: "Ownership verification was not sufficient.",
                  })
                }
              >
                Reject claim
              </button>
            </>
          )}
          {[
            "VERIFIED",
            "RETURN_ARRANGEMENT_PENDING",
            "RETURN_ARRANGED",
          ].includes(data.status) && (
            <button
              disabled={busy}
              onClick={() =>
                act("return-arrangement", {
                  approximatePlace: "Agreed public meeting point",
                  scheduledAt: new Date(Date.now() + 864e5).toISOString(),
                  safetyAcknowledged: true,
                })
              }
            >
              Propose safe return
            </button>
          )}
          {["RETURN_ARRANGEMENT_PENDING", "RETURN_ARRANGED"].includes(
            data.status,
          ) && (
            <button disabled={busy} onClick={() => act("handover-code")}>
              Generate handover code
            </button>
          )}
          {handoverCode && (
            <p>
              <strong>Show once: {handoverCode}</strong>
            </p>
          )}
          {data.status === "HANDOVER_PENDING" && (
            <>
              <label>
                Handover code
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={handoverCode}
                  onChange={(e) => setHandoverCode(e.target.value)}
                />
              </label>
              <button
                disabled={busy}
                onClick={() =>
                  act("verify-handover-code", { code: handoverCode })
                }
              >
                Verify code
              </button>
              <button disabled={busy} onClick={() => act("confirm-handover")}>
                Confirm handover
              </button>
            </>
          )}
          <hr />
          <h3>Optional reward</h3>
          <p>
            Never pay advance money or share OTP, PIN, or bank passwords. Khoya
            Paya does not process or guarantee payment.
          </p>
          <button
            onClick={() => act("reward", { status: "WAIVED", currency: "INR" })}
          >
            Waive reward
          </button>
          <hr />
          <h3>Success story</h3>
            {data.status === "RECOVERY_CONFIRMED" && (
              <>
                <button
                  onClick={() =>
                    act("success-story/consent", {
                      consent: true,
                      anonymous: true,
                      allowCity: false,
                      allowApprovedPhoto: false,
                    })
                  }
                >
                  Allow anonymous story
                </button>
                <button onClick={() => act("success-story/publish")}>
                  Publish consented story
                </button>
              </>
            )}
          <hr />
          <h3>Safety dispute</h3>
          <button
            onClick={() =>
              act("disputes", {
                reason: "OTHER",
                description:
                  "I need an administrator to review a concern with this recovery workflow.",
              })
            }
          >
            Open dispute
          </button>
          {notice && <p role="status">{notice}</p>}
          {error && <p role="alert">{error}</p>}
        </div>
      </aside>
    </div>
  );
}
