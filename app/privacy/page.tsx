import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome';

export const metadata: Metadata = {
  title: 'Privacy · papicture',
  description: 'How papicture handles your photo and personal details.',
};

export default function PrivacyPage() {
  return (
    <div className="pa-host-doc">
      <SiteHeader />
      <main className="pa-doc">
        <p className="pa-eyebrow">Privacy</p>
        <h1 className="pa-h1">Your photo, handled with care</h1>
        <p className="pa-lead" style={{ marginTop: 10 }}>
          We collect the minimum we need to make your photo and get it to you. This page explains what that is.
        </p>

        <section style={{ marginTop: 26 }}>
          <h2 className="pa-h3">What we collect</h2>
          <p className="pa-body" style={{ marginTop: 6 }}>
            The photo you upload or capture, and the details you enter at checkout: your name, email, mobile
            number, and, for printed orders, your delivery address.
          </p>
        </section>

        <section style={{ marginTop: 20 }}>
          <h2 className="pa-h3">How we use it</h2>
          <p className="pa-body" style={{ marginTop: 6 }}>
            Your photo is processed only to produce the formats you order. Your contact details are used to send
            your files and order updates, and your address is used to deliver printed sets.
          </p>
        </section>

        <section style={{ marginTop: 20 }}>
          <h2 className="pa-h3">How long we keep it</h2>
          <p className="pa-body" style={{ marginTop: 6 }}>
            We keep your photo only as long as needed to deliver your order, then remove it. We do not sell your
            data or use your photo to train models.
          </p>
        </section>

        <section style={{ marginTop: 20 }}>
          <h2 className="pa-h3">Payments</h2>
          <p className="pa-body" style={{ marginTop: 6 }}>
            Payments are processed by PayRex. We never see or store your full card or e-wallet details.
          </p>
        </section>

        <section style={{ marginTop: 20 }}>
          <h2 className="pa-h3">Your rights</h2>
          <p className="pa-body" style={{ marginTop: 6 }}>
            Under the Philippine Data Privacy Act (RA 10173) you can ask to access or delete your data. Email{' '}
            <a className="pa-doc-link" href="mailto:hello@papicture.com">hello@papicture.com</a> and we will action it.
          </p>
        </section>

        <p className="pa-small" style={{ marginTop: 28 }}>
          This is a starting policy for the prototype and should be reviewed before launch.
        </p>
        <div style={{ marginTop: 22 }}>
          <Link className="pa-doc-link" href="/">← Back to papicture</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
