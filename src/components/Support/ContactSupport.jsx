"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ContactSupport() {
  const supabase = createClient();
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });
  const [showContactForm, setShowContactForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!contactForm.subject || !contactForm.message) {
        throw new Error("Please fill in all fields");
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Insert ticket into database
      const ticketData = {
        user_id: user?.id || null,
        subject: contactForm.subject,
        message: contactForm.message,
        priority: "medium",
      };

      const { error: insertError } = await supabase
        .from("tickets")
        .insert([ticketData]);

      if (insertError) throw insertError;

      setContactForm({ subject: "", message: "" });
      setShowContactForm(false);
      alert("Thank you for contacting us! We'll respond within 24 hours.");
    } catch (err) {
      alert(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t pt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Still Need Help?
        </h2>
        <button
          onClick={() => setShowContactForm(!showContactForm)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
        >
          {showContactForm ? "Close Form" : "Submit a Ticket"}
        </button>
      </div>

      {showContactForm && (
        <form
          onSubmit={handleContactSubmit}
          className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={contactForm.subject}
              onChange={(e) =>
                setContactForm({ ...contactForm, subject: e.target.value })
              }
              placeholder="Brief description of your issue"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={contactForm.message}
              onChange={(e) =>
                setContactForm({ ...contactForm, message: e.target.value })
              }
              placeholder="Provide details about your question or issue"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black resize-none"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
            <button
              type="button"
              onClick={() => setShowContactForm(false)}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-gray-500">
            We typically respond within 24 hours during business days
          </p>
        </form>
      )}
    </div>
  );
}
