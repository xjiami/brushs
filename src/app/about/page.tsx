'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">About Us</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Procreate Brush Resource Website</p>
      </div>

      <div className="prose prose-blue max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400">
        <section className="mb-10">
          <h2>Our Story</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <p>
                The Procreate Brush Resource Website was founded in 2023 by a group of designers and developers passionate about digital art creation. We noticed that despite Procreate being a powerful digital painting application, many artists struggled to find high-quality, diverse brush resources to fully realize its potential.
              </p>
              <p>
                Based on this discovery, we decided to create a dedicated platform that brings together premium Procreate brush resources, making it easy for artists to access and use these tools to enhance their creative experience.
              </p>
            </div>
            <div className="w-full md:w-1/3 relative h-64 rounded-lg overflow-hidden shadow-lg">
              <Image
                src="https://via.placeholder.com/600x400/6D28D9/FFFFFF?text=Our Team"
                alt="Our Team"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2>Our Mission</h2>
          <p>
            Our mission is to provide digital artists with high-quality, diverse Procreate brush resources to help them unleash their creative potential and enhance their artistic expression.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Quality Commitment</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We carefully select and test each brush to ensure it meets professional creation standards.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Innovation Driven</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We continuously explore new brush techniques and effects to provide artists with cutting-edge creative tools.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Community Support</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We value user feedback and are committed to building a collaborative and supportive digital art community.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2>Our Team</h2>
          <p>
            Our team consists of digital art enthusiasts and professionals, including illustrators, UI designers, developers, and content creators. Each member contributes their expertise and creativity to the development of the website.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <Image
                  src="https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=L"
                  alt="Li Xiaoming"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold">Li Xiaoming</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Founder & Art Director</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <Image
                  src="https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=Z"
                  alt="Zhang Wei"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold">Zhang Wei</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Chief Developer</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <Image
                  src="https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=W"
                  alt="Wang Fang"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold">Wang Fang</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Content Strategist & Brush Designer</p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2>Contact Us</h2>
          <p>
            We look forward to hearing from you! Whether it's product feedback, partnership proposals, or technical support, please feel free to contact us.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg mt-4">
            <p className="mb-4">You can contact us through the following channels:</p>
            <ul className="space-y-2">
              <li>
                <strong>Customer Support:</strong> 
                <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Contact Form
                </Link>
              </li>
              <li>
                <strong>Business Cooperation:</strong> business@procreatebrush-example.com
              </li>
              <li>
                <strong>Join Our Team:</strong> careers@procreatebrush-example.com
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2>Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Creativity Without Limits</h3>
              <p>
                We believe everyone has unlimited creative potential. Our tools are designed to break down technical limitations and let your imagination run free.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Quality First</h3>
              <p>
                Our pursuit of quality is relentless. Every brush is rigorously tested to ensure it meets the demands of professional artists.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Continuous Innovation</h3>
              <p>
                We constantly explore the boundaries of digital art, committed to bringing the latest creative trends and technologies to our users.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">User-Centric</h3>
              <p>
                Our decisions are always centered on user experience, continuously improving our products and services to meet your needs.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 