"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ChatMessage } from "@/types";
import { messageLink, site, smsLink } from "@/config/site";
import { EASE } from "@/lib/motion";
import { Button } from "./ui/Button";
import s from "./ChatWidget.module.css";

const GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi! I’m the Royal Crest assistant. Ask me about the trucks or how to reserve one online. If you’d rather talk to the team, use the links below.",
};

const FALLBACK = "I can’t reach the assistant right now. Please use the WhatsApp, text or call links below and the team will reply.";
const HELLO = `Hi ${site.name}, I have a question about your trucks.`;

const icon = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

const WhatsAppIcon = () => (
  <svg {...icon}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-1.6-1.6l.8-1-1-2z" /></svg>
);
const TextIcon = () => (
  <svg {...icon}><rect x="3" y="4" width="18" height="14" rx="3" /><path d="M8 21l3-3M8 10h8M8 13h5" /></svg>
);
const CallIcon = () => (
  <svg {...icon}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
);
const AssistantIcon = () => (
  <svg {...icon}><rect x="4" y="8" width="16" height="11" rx="3" /><path d="M12 4v4M9 13h.01M15 13h.01M9 16.5h6" /></svg>
);

function Option({ href, onClick, icon, title, note }: { href?: string; onClick?: () => void; icon: ReactNode; title: string; note: string }) {
  const body = (
    <>
      <span className={s.optionIcon}>{icon}</span>
      <span className={s.optionText}>
        <strong>{title}</strong>
        <span>{note}</span>
      </span>
    </>
  );
  if (href) {
    const external = href.startsWith("http");
    return <a className={s.option} href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>{body}</a>;
  }
  return <button type="button" className={s.option} onClick={onClick}>{body}</button>;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "assistant">("menu");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [pending, setPending] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, pending, view]);

  // Esc closes the whole widget
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || pending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setDraft("");
    setPending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== GREETING) }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string };
      if (!res.ok || !data.reply) throw new Error(`chat failed (${res.status})`);
      const reply = data.reply;
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { role: "assistant", content: FALLBACK }]);
    } finally {
      setPending(false);
    }
  }

  const inAssistant = view === "assistant";

  return (
    <div className={s.root}>
      <AnimatePresence>
        {open && (
          <motion.section
            className={`${s.panel} ${inAssistant ? s.tall : ""}`}
            aria-label="Contact Royal Crest Autos"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className={s.head}>
              {inAssistant && (
                <button type="button" className={s.iconBtn} onClick={() => setView("menu")} aria-label="Back to contact options">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </button>
              )}
              <div className={s.headText}>
                <strong>{inAssistant ? "Royal Crest assistant" : "How can we help?"}</strong>
                <span>{inAssistant ? "Automated help, available any time" : "Pick the way that suits you"}</span>
              </div>
              <button type="button" className={s.iconBtn} onClick={() => setOpen(false)} aria-label="Close chat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {!inAssistant ? (
              <div className={s.menu}>
                <Option href={messageLink(HELLO)} icon={<WhatsAppIcon />} title="Chat on WhatsApp" note={`${site.whatsappDisplay} · fastest reply`} />
                <Option href={smsLink(HELLO)} icon={<TextIcon />} title="Send a text message" note={site.phoneDisplay} />
                <Option href={site.phoneHref} icon={<CallIcon />} title="Call us" note={site.phoneDisplay} />
                <Option onClick={() => setView("assistant")} icon={<AssistantIcon />} title="Ask our assistant" note="Instant answers if the team is busy" />
              </div>
            ) : (
              <>
                <div className={s.log} ref={logRef} role="log" aria-live="polite">
                  {messages.map((m, i) => (
                    <p key={i} className={`${s.msg} ${s[m.role]}`}>{m.content}</p>
                  ))}
                  {pending && <p className={`${s.msg} ${s.assistant}`}>Typing…</p>}
                </div>

                <form className={s.form} onSubmit={submit}>
                  <input
                    className={s.input}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type your question"
                    aria-label="Your message"
                    maxLength={500}
                  />
                  <Button type="submit" disabled={pending}>Send</Button>
                </form>

                <div className={s.quick}>
                  <span>Prefer a person?</span>
                  <a href={messageLink(HELLO)} target="_blank" rel="noreferrer">WhatsApp</a>
                  <a href={smsLink(HELLO)}>Text</a>
                  <a href={site.phoneHref}>Call</a>
                </div>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <button className={s.launcher} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Close chat" : "Open chat"}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
        </svg>
        Chat with us
      </button>
    </div>
  );
}