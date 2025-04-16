'use client';

import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Refund Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString('en-US')}</p>
      </div>

      <div className="prose prose-blue max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400">
        <section className="mb-10">
          <h2>Overview</h2>
          <p>
            Thank you for purchasing our products on the Procreate Brush website. This refund policy explains our refund process and conditions.
          </p>
          <p>
            We hope you are completely satisfied with your brush purchases and subscriptions. However, if you are not satisfied with your product, we offer the following refund options.
          </p>
        </section>

        <section className="mb-10">
          <h2>Single Purchase Brushes</h2>
          <p>
            For individually purchased brush products, we provide the following refund policy:
          </p>
          <ul>
            <li><strong>14-Day Refund Period:</strong> If you request a refund within 14 days of purchase and have not downloaded the brush files, we will provide a full refund.</li>
            <li><strong>Quality Issues:</strong> If you discover technical problems with the brush product or find it doesn't match the description, please contact us within 30 days of purchase. We will evaluate the issue and may provide a refund.</li>
            <li><strong>Downloaded Products:</strong> Once you have downloaded the brush files, due to the nature of digital products, we typically do not provide refunds unless the product has significant technical defects.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2>Subscription Plans</h2>
          <p>
            For our subscription services, the refund policy is as follows:
          </p>
          <ul>
            <li><strong>7-Day Trial Period:</strong> If you cancel within 7 days of your initial subscription, we will provide a full refund.</li>
            <li><strong>Monthly Subscriptions:</strong> Monthly subscriptions are typically not eligible for prorated refunds after payment. You can cancel your subscription at any time, but your access will continue until the end of the current billing cycle.</li>
            <li><strong>Annual Subscriptions:</strong> Annual subscriptions canceled within 30 days of purchase may be eligible for a prorated refund, minus the cost of services already used.</li>
          </ul>
          <p>
            Please note that we reserve the right to refuse refunds if we detect abusive downloading behavior or other violations of our terms of service on your account.
          </p>
        </section>

        <section className="mb-10">
          <h2>How to Apply for a Refund</h2>
          <p>To request a refund, please follow these steps:</p>
          <ol>
            <li>Log in to your account</li>
            <li>Visit the "My Orders" or "Subscriptions" section</li>
            <li>Find the order you want a refund for</li>
            <li>Click the "Request Refund" button</li>
            <li>Complete the refund reason form</li>
          </ol>
          <p>
            Alternatively, you can contact our customer support team directly through our <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Page</Link>.
          </p>
          <p>
            Please include the following information in your refund request:
          </p>
          <ul>
            <li>Your full name and email address</li>
            <li>Order number or transaction ID</li>
            <li>Date of purchase</li>
            <li>Name of the product you're requesting a refund for</li>
            <li>Detailed reason for your refund request</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2>Refund Processing</h2>
          <p>
            Refunds will be processed through your original payment method. Depending on your bank or payment provider's policies, refunds may take 5-10 business days to appear in your account.
          </p>
        </section>

        <section className="mb-10">
          <h2>Exceptions</h2>
          <p>The following situations may not qualify for a refund:</p>
          <ul>
            <li>Exceeding the specified refund period</li>
            <li>Downloaded digital products (unless there are significant technical issues)</li>
            <li>Products purchased on promotion or with discounts (unless required by law)</li>
            <li>Accounts with abusive downloading behavior or violations of terms of service</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2>Policy Changes</h2>
          <p>
            We reserve the right to modify or update this refund policy at any time. Any changes will be posted on this page and will be effective from the date of posting. We recommend that you review this policy regularly to be aware of any changes.
          </p>
        </section>

        <section className="mb-10">
          <h2>Contact Us</h2>
          <p>
            If you have any questions about our refund policy or need further clarification, please contact us at:
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