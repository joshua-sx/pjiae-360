
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How long does it take to set up Smartgoals 360?",
      answer: "Most organizations are up and running within 24-48 hours. Our onboarding team will guide you through importing your employee data, setting up your organizational structure, and customizing your first review cycle."
    },
    {
      question: "Can I import my existing employee data?",
      answer: "Yes! We support CSV imports and have integrations with popular HRIS systems like BambooHR, Workday, and ADP. Our team can also help with custom data migrations if needed."
    },
    {
      question: "Is my data secure with Smartgoals 360?",
      answer: "Absolutely. We use bank-level encryption, are SOC 2 compliant, and follow strict data privacy regulations including GDPR. Your data is stored securely and never shared with third parties."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We offer email support for all plans, priority support for Professional plans, and dedicated success managers for Enterprise customers. We also provide comprehensive documentation and video tutorials."
    },
    {
      question: "Can I customize the review process?",
      answer: "Yes, Smartgoals 360 is highly customizable. You can create custom review templates, set up different review cycles for different departments, and configure competency frameworks that match your organization's values."
    },
    {
      question: "Do you offer integrations with other tools?",
      answer: "We integrate with popular tools like Slack, Microsoft Teams, Google Workspace, and many HRIS systems. We also provide API access for Enterprise customers who need custom integrations."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Smartgoals 360
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-8 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
