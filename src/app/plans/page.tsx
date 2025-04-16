import SubscriptionPlans from "../../../components/SubscriptionPlans";
import FaqSection, { defaultFaqItems } from "../../../components/Faq";

export const metadata = {
  title: 'Subscription Plans - Procreate Brush Resource Website',
  description: 'Choose a subscription plan that suits your needs and get access to high-quality Procreate brush resources.',
};

export default function PlansPage() {
  return (
    <div className="space-y-16 max-w-7xl mx-auto pb-16">
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
          Subscription Plans
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Choose a subscription plan that meets your creative needs, unlock our rich collection of high-quality Procreate brushes, and enhance your creativity and artwork quality.
        </p>
      </div>

      <SubscriptionPlans />

      <FaqSection items={defaultFaqItems} />
    </div>
  );
} 