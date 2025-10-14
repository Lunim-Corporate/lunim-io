import { FC } from "react";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";
import { asText } from "@prismicio/helpers";
import { Clock, Mail, Phone, LucideProps } from "lucide-react";
import ContactForm from "@/components/sections/ContactForm";
import { Content } from "@prismicio/client";
// Budget options
import model from "@/slices/Contact/model.json";

/**
 * Props for `Contact`.
 */
export type ContactProps = SliceComponentProps<Content.ContactSlice>;

const budgetOptions: string[] =
  model.variations[0].primary.budget_options.config.options;
const iconComponents: { [key: string]: React.ComponentType<LucideProps> } = {
  Clock: Clock,
  Mail: Mail,
  Phone: Phone,
};

/**
 * Component for "Contact" Slices.
 */
const Contact: FC<ContactProps> = ({ slice }) => {
  const contactItems = slice.primary.contact_info || [];
  const officeHourItems = slice.primary.office_info || [];

  return (
    <section className="bg-[#0f172a] py-20" id="get-in-touch">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Title */}
        <div className="text-3xl font-bold text-white mb-4 text-center">
          <PrismicRichText field={slice.primary.main_title} />
        </div>

        {/* Subtitle */}
        <div className="text-lg text-gray-300 mb-12 text-center">
          <PrismicRichText field={slice.primary.subtitle} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-[#1a202c] p-8 rounded-lg shadow-xl border border-white">
              <h3 className="text-xl font-bold text-white mt-1 mb-6">
                {asText(slice.primary.contact_us_title)}
              </h3>
              <ul className="space-y-4">
                {contactItems.map((item, index) => {
                  const Icon = iconComponents[item.icon_name || ""] || Clock;
                  return (
                    <li key={index} className="flex items-start space-x-3">
                      <Icon className="w-6 h-6 text-[#BBFEFF] flex-shrink-0" />
                      <div>
                        <p className="text-white mb-1 font-semibold">
                          {item.title}
                        </p>
                        <p className="text-gray-200 text-base">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Office Hours */}
            <div className="bg-[#1a202c] p-8 rounded-lg shadow-xl border border-white">
              <h3 className="text-xl font-bold text-white mt-1 mb-6">
                {asText(slice.primary.office_hours_title)}
              </h3>
              <ul className="space-y-3 text-gray-300">
                {officeHourItems.map((hour, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="font-semibold">{hour.days}</span>
                    {hour.is_closed ? (
                      <span className="text-red-400">Closed</span>
                    ) : (
                      <span>{hour.hours}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm
            title={slice.primary.form_title}
            fullNameLabel={slice.primary.full_name_field_label ?? undefined}
            emailLabel={slice.primary.email_field_label ?? undefined}
            companyLabel={slice.primary.company_field_label ?? undefined}
            budgetLabel={slice.primary.project_budget_label ?? undefined}
            goalsLabel={slice.primary.project_goals_label ?? undefined}
            buttonLabel={slice.primary.button_label ?? undefined}
            budgetOptions={budgetOptions ?? undefined}
          />
        </div>
      </div>
    </section>
  );
};

export default Contact;
