"use client";
import React from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { asText } from "@prismicio/helpers";
import { Clock, Mail, Phone, LucideProps } from "lucide-react";
import ContactForm from "./ContactForm";

const iconComponents: { [key: string]: React.ComponentType<LucideProps> } = {
  Clock: Clock,
  Mail: Mail,
  Phone: Phone,
};

interface ContactSectionProps {
  slice: Content.ContactSlice;
}

const ContactSection: React.FC<ContactSectionProps> = ({ slice }) => {
  const contactItems = slice.items.filter(
    (item) => item.item_type === "Contact Info"
  );
  const officeHourItems = slice.items.filter(
    (item) => item.item_type === "Office Hour"
  );

  return (
    <section
      id={slice.primary.section_id || undefined}
      className="bg-[#0f172a] py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-3xl font-bold text-white mb-4 text-center">
          <PrismicRichText field={slice.primary.main_title} />
        </div>
        <PrismicRichText
          field={slice.primary.subtitle}
          components={{
            heading1: ({ children }) => (
              <p className="text-lg text-gray-300 mb-12 text-center">
                {children}
              </p>
            ),
            heading2: ({ children }) => (
              <p className="text-lg text-gray-300 mb-12 text-center">
                {children}
              </p>
            ),
            heading3: ({ children }) => (
              <p className="text-lg text-gray-300 mb-12 text-center">
                {children}
              </p>
            ),
            heading4: ({ children }) => (
              <p className="text-lg text-gray-300 mb-12 text-center">
                {children}
              </p>
            ),
            heading5: ({ children }) => (
              <p className="text-lg text-gray-300 mb-12 text-center">
                {children}
              </p>
            ),
            heading6: ({ children }) => (
              <p className="text-lg text-gray-300 mb-12 text-center">
                {children}
              </p>
            ),
            paragraph: ({ children }) => (
              <p className="text-lg text-gray-300 mb-12 text-center">
                {children}
              </p>
            ),
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <div className="bg-[#1a202c] p-8 rounded-lg shadow-xl border border-white">
              <h3 className="text-xl font-bold text-white mt-1 mb-6">
                {asText(slice.primary.info_title)}
              </h3>
              <ul className="space-y-4">
                {contactItems.map((item, index) => {
                  const Icon = iconComponents[item.icon_name || ""] || Clock;
                  const description = item.info_item_description || "";
                  let href = "";

                  if (item.link_type === "Email") {
                    href = `mailto:${description}`;
                  } else if (item.link_type === "Phone") {
                    const formattedPhone = description.replace(/\s/g, "");
                    href = `tel:+44${formattedPhone.substring(1)}`;
                  }

                  return (
                    <li key={index} className="flex items-start space-x-3">
                      <Icon className="w-6 h-6 text-[#BBFEFF] flex-shrink-0" />
                      <div>
                        <p className="text-white mb-1 font-semibold">
                          {item.info_item_title}
                        </p>
                        {item.link_type === "Email" ||
                        item.link_type === "Phone" ? (
                          <a
                            href={href}
                            className="text-gray-200 text-base hover:text-cyan-400 transition-colors duration-200 cursor-pointer"
                          >
                            {description}
                          </a>
                        ) : (
                          <p className="text-gray-200 text-base">
                            {description}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-[#1a202c] p-8 rounded-lg shadow-xl border border-white">
              <h3 className="text-xl font-bold text-white mt-1 mb-6">
                {asText(slice.primary.hours_title)}
              </h3>
              <ul className="space-y-3 text-gray-300">
                {officeHourItems.map((hour, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="font-semibold">{hour.days}</span>
                    {hour.is_closed ? (
                      <span className="text-red-400">{hour.hours}</span>
                    ) : (
                      <span>{hour.hours}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ContactForm
            title={slice.primary.form_title}
            fullNameLabel={slice.primary.full_name_label}
            emailLabel={slice.primary.email_label}
            companyLabel={slice.primary.company_label}
            budgetLabel={slice.primary.budget_label}
            goalsLabel={slice.primary.goals_label}
            buttonLabel={slice.primary.button_label}
            budgetOptions={slice.primary.budget_options}
          />
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
