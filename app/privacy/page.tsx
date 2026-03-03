export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-playfair text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted text-sm mb-8">Last updated: March 2026</p>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-ink">
        <section>
          <h2 className="font-bold text-base mb-2">Information We Collect</h2>
          <p>We collect your username and password when you register. Passwords are stored securely using industry standard hashing.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">How We Use Your Information</h2>
          <p>Your information is used solely to provide the BabelBridge service — creating and joining language learning rooms, storing conversation history and scores.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">Data Storage</h2>
          <p>Your data is stored securely in MongoDB Atlas. We do not sell or share your data with third parties.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">Third Party Services</h2>
          <p>We use Google Gemini AI to generate conversation content. No personally identifiable information is shared with Google Gemini.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">Contact</h2>
          <p>For any privacy related questions contact us at shubhankar.a31@gmail.com</p>
        </section>
      </div>
    </main>
  )
}