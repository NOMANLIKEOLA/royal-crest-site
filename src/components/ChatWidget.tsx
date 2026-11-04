"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ChatMessage } from "@/types";
import { messageLink } from "@/config/site";
import { EASE } from "@/lib/motion";
import { Button } from "./ui/Button";
import s from "./ChatWidget.module.css";

const GREETING: ChatMessage = {
  role: "assistant",
  content: "Hi! I’m the Royal Crest assistant. Ask me about the trucks or how to reserve one online. If you’d rather talk to the team, use the WhatsApp link below.",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [pending, setPending] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, pending]);

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
      if (!res.ok || !data.reply) throw new Error("chat failed");
      const reply = data.reply;
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I can’t reach the assistant right now. Please tap “Continue on WhatsApp” below and the team will reply." },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={s.root}>
      <AnimatePresence>
        {open && (
          <motion.section
            className={s.panel}
            aria-label="Royal Crest assistant"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className={s.head}>
              <strong>Royal Crest assistant</strong>
              <span>Automated help, available any time</span>
            </div>
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
            <a className={s.wa} href={messageLink("Hi! I was chatting on your website and would like to talk to the team.")} target="_blank" rel="noreferrer">
              Continue on WhatsApp with the team
            </a>
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