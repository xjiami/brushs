'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Terms of Service</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString('en-US')}</p>
      </div>

      <div className="prose prose-blue max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400">
        <section className="mb-10">
          <h2>Overview</h2>
          <p>
            Welcome to the Procreate Brush website. These Terms and Conditions ("Terms") govern your use of our website, including all related content, features, and services.
          </p>
          <p>
            By accessing or using our website, you agree to be bound by these Terms. If you do not agree to any part of these Terms, you may not access the website or use any of our services.
          </p>
        </section>

        <section className="mb-10">
          <h2>Account Registration</h2>
          <p>
            When you create an account, you must provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account.
          </p>
          <p>
            We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel orders at our discretion.
          </p>
        </section>

        <section className="mb-10">
          <h2>Intellectual Property</h2>
          <p>
            The website and its original content, features, and design elements are owned by us and are protected by international copyright laws.
          </p>
          <p>
            <strong>Brush License:</strong> When you purchase or download our brushes, we grant you a non-exclusive, non-transferable license to use these brushes in your personal creative projects.
          </p>
          <p>
            <strong>Restrictions:</strong> You may not:
          </p>
          <ul>
            <li>Resell, distribute, or rent our brushes</li>
            <li>Offer our brushes as your own work</li>
            <li>Share brush files between different accounts</li>
            <li>Decompile or attempt to extract the source code of our brushes</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2>User Conduct</h2>
          <p>
            You agree not to use the website:
          </p>
          <ul>
            <li>In any way that could damage or impair the website's availability or accessibility</li>
            <li>In violation of any applicable national or international law or regulation</li>
            <li>To impersonate or attempt to impersonate the company, employee, another user, or any other person</li>
            <li>To engage in any fraudulent, deceptive, or misleading activity</li>
            <li>To upload or transmit viruses, trojans, or other harmful material</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2>Purchases and Subscriptions</h2>
          <p>
            <strong>Payment:</strong> By providing payment information, you represent and warrant that you have the right to use the payment method provided and authorize us to charge you through that payment method.
          </p>
          <p>
            <strong>Pricing:</strong> All prices are subject to change at any time without notice. We are not responsible for pricing errors and reserve the right to correct any pricing errors.
          </p>
          <p>
            <strong>Subscriptions:</strong> Unless you cancel your subscription, we will automatically renew your subscription and charge you according to your chosen billing cycle. You can cancel your subscription at any time in your account settings.
          </p>
          <p>
            <strong>Refunds:</strong> For information about refunds, please refer to our <Link href="/refund" className="text-blue-600 dark:text-blue-400 hover:underline">Refund Policy</Link>.
          </p>
        </section>

        <section className="mb-10">
          <h2>Disclaimer</h2>
          <p>
            This website and its contents are provided "as is" without warranty of any kind, either express or implied.
          </p>
          <p>
            We do not guarantee that the website will be error-free or uninterrupted, nor do we guarantee that any defects will be corrected, or that the website or server providing it are free of viruses or other harmful components.
          </p>
        </section>

        <section className="mb-10">
          <h2>Limitation of Liability</h2>
          <p>
            In no event shall we be liable for any loss or damage arising from the use of or inability to use this website, including but not limited to direct, indirect, special, incidental, or consequential damages.
          </p>
        </section>

        <section className="mb-10">
          <h2>Privacy Policy</h2>
          <p>
            Your use of this website is also subject to our <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</Link>, which is incorporated into these Terms of Service.
          </p>
        </section>

        <section className="mb-10">
          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. Modified terms will be effective immediately upon posting on the website. By continuing to access or use our website after changes are posted, you agree to be bound by the modified terms.
          </p>
          <p>
            We recommend that you check these Terms regularly for any changes.
          </p>
        </section>

        <section className="mb-10">
          <h2>Applicable Law</h2>
          <p>
            These Terms and your use of the website are governed by and construed in accordance with the laws of the United States, without regard to its conflict of law principles.
          </p>
        </section>

        <section className="mb-10">
          <h2>Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <p>
            <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
              Contact Page
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
} 