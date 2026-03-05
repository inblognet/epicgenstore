// components/shop/contact-form.tsx
"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { submitContactMessage } from "@/app/actions/contact";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await submitContactMessage(formData);
    if (res.success) {
      setSubmitted(true);
    } else {
      alert("Failed to send message. Please try again.");
    }
    setIsSubmitting(false);
  }

  if (submitted) {
    return (
      // REPLACED: bg-[#121212] -> bg-surface-card
      <div className="bg-surface-card border border-green-500/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px] transition-colors duration-300">
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
          <Send className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
        <p className="text-zinc-400">Thank you for reaching out. Our team will get back to you shortly.</p>
        {/* REPLACED: text-yellow-500 -> text-brand */}
        <button onClick={() => setSubmitted(false)} className="mt-8 text-brand text-sm font-bold hover:underline transition-colors duration-300">
          Send another message
        </button>
      </div>
    );
  }

  return (
    // REPLACED: bg-[#121212] -> bg-surface-card
    <form onSubmit={handleSubmit} className="bg-surface-card border border-zinc-800/50 rounded-3xl p-8 shadow-2xl transition-colors duration-300">
      <h3 className="text-xl font-bold text-white mb-6">Send Us a Message</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 uppercase font-bold">First Name</label>
          {/* REPLACED: bg-[#0a0a0a] focus:border-yellow-500 -> bg-surface-bg focus:border-brand */}
          <input type="text" name="firstName" required className="w-full bg-surface-bg border border-zinc-800/50 rounded-lg px-4 py-3 text-sm text-white focus:border-brand outline-none transition-colors duration-300" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 uppercase font-bold">Last Name</label>
          <input type="text" name="lastName" required className="w-full bg-surface-bg border border-zinc-800/50 rounded-lg px-4 py-3 text-sm text-white focus:border-brand outline-none transition-colors duration-300" />
        </div>
      </div>
      <div className="space-y-4 mb-6">
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 uppercase font-bold">Email</label>
          <input type="email" name="email" required className="w-full bg-surface-bg border border-zinc-800/50 rounded-lg px-4 py-3 text-sm text-white focus:border-brand outline-none transition-colors duration-300" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 uppercase font-bold">Phone</label>
          <input type="tel" name="phone" required className="w-full bg-surface-bg border border-zinc-800/50 rounded-lg px-4 py-3 text-sm text-white focus:border-brand outline-none transition-colors duration-300" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 uppercase font-bold">Service Type</label>
          <select name="serviceType" required className="w-full bg-surface-bg border border-zinc-800/50 rounded-lg px-4 py-3 text-sm text-zinc-400 focus:border-brand outline-none appearance-none transition-colors duration-300 cursor-pointer">
            <option value="General Inquiry">General Inquiry</option>
            <option value="Sales">Sales & Quotations</option>
            <option value="Repair">Repair Service</option>
            <option value="Warranty">Warranty Claim</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-500 uppercase font-bold">Message</label>
          <textarea name="message" required rows={4} className="w-full bg-surface-bg border border-zinc-800/50 rounded-lg px-4 py-3 text-sm text-white focus:border-brand outline-none resize-none transition-colors duration-300" />
        </div>
      </div>
      {/* REPLACED: bg-yellow-500 hover:bg-yellow-600 -> bg-brand hover:bg-brand-hover */}
      <button type="submit" disabled={isSubmitting} className="w-full bg-brand hover:bg-brand-hover text-black font-bold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand/20">
        <Send className="w-4 h-4" /> {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}