import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome';

export const metadata: Metadata = {
  title: 'Terms · papicture',
  description: 'The terms for using papicture.',
};

export default function TermsPage() {
  return (
    <div className="pa-host-doc">
      <SiteHeader />
      <main className="pa-doc">
        <p className="pa-eyebrow">Terms</p>
        <h1 className="pa-h1">Terms of service</h1>
        <p className="pa-lead" style={{ marginTop: 10 }}>
          Plain terms for using papicture. By placing an order you agree to these.
        </p>

        <section style={{ marginTop: 26 }}>
          <h2 className="pa-h3">What we do</h2>
          <p className="pa-body" style={{ marginTop: 6 }}>
            We turn your photo into submission-ready files, and for printed orders we cut and deliver a set
            nationwide. We size each format to the current published spec.
          </p>
        </section>

        <section style={{ marginTop: 20 }}>
          <h2 className="pa-h3">Acceptance is not guaranteed</h2>
          <p className="pa-body" style={{ marginTop: 6 }}>
            papicture is not affiliated with any government agency. Acceptance is decided by the requesting
            office, so please check the latest requirements before you submit.
          </p>
        </section>

        <section style={{ marginTop: 20 }}>
          <h2 className="pa-h3">Payment</h2>
          <p className="pa-body" style={{ marginTop: 6 }}>
            Prices are shown in Philippine peso and charged at checkout through PayRex. A free preview is
            available before you pay.
          </p>
        </section>

        <section style={{ marginTop: 20 }}>
          <h2 className="pa-h3">Your photo</h2>
          <p className="pa-body" style={{ marginTop: 6 }}>
            You keep ownership of your photo. You confirm you have the right to use it, and you grant us
            permission to process it solely to fulfil your order.
          </p>
        </section>

        <section style={{ marginTop: 20 }}>
          <h2 className="pa-h3">Refunds</h2>
          <p className="pa-body" style={{ marginTop: 6 }}>
            If a file is unusable due to an error on our side, contact us and we will reprocess or refund it.
          </p>
        </section>

        <p className="pa-small" style={{ marginTop: 28 }}>
          These are starting terms for the prototype and should be reviewed before launch.
        </p>
        <div style={{ marginTop: 22 }}>
          <Link className="pa-doc-link" href="/">← Back to papicture</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
