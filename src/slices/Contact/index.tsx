"use client";
import { FC, useMemo, type ComponentType } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { asText } from "@prismicio/helpers";
import { Clock, Mail, Phone, LucideProps } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import type { Content } from "@prismicio/client";
import model from "@/slices/Contact/model.json";
import { usePathname } from "next/navigation";

/**
 * Props for `Contact`.
 */
export type ContactProps = SliceComponentProps<Content.ContactSlice>;

const budgetOptions: string[] =
  model.variations[0].primary.budget_options.config.options;

const iconComponents: Record<string, ComponentType<LucideProps>> = {
  Clock,
  Mail,
  Phone,
};

const Contact: FC<ContactProps> = ({ slice }) => {
  const pathname = usePathname();

  // Route-based variant to drive copy & field visibility
  const variant = useMemo<"home" | "tech" | "film" | "academy" | "tabb" | "default">(() => {
    const p = pathname.replace(/\/+$/, "") || "/";
    if (p === "/") return "home";
    if (p === "/tabb" || p.startsWith("/tabb/")) return "tabb";
    if (p === "/tech" || p.startsWith("/tech/")) return "tech";
    if (p === "/film" || p.startsWith("/film/")) return "film";
    if (p === "/academy" || p.startsWith("/academy/")) return "academy";
    return "default";
  }, [pathname]);

  // Title overrides per page
  const computedMainTitle = (() => {
    if (variant === "home" || variant === "film") return "Ready to Go?";
    if (variant === "academy") return "Ready to Learn?";
    return asText(slice.primary.main_title) || "Get in Touch";
  })();

  const computedSubtitle = (() => {
    if (variant === "home" || variant === "film")
      return "Let’s discuss how we can help you take your next giant leap.";
    if (variant === "academy")
      return "Let’s get you on the road to powering up your workflow.";
    return asText(slice.primary.subtitle) || "";
  })();

  // Left panels content adjustments:
  const waysTitle = "Ways to Contact Us";
  const waysSubtitle = "We respond to all queries within 24 hours";

  const contactItems = slice.primary.contact_info || [];
  const officeHourItems = slice.primary.office_info || [];

  // Hidden source to send with submission (page title + path)
  const sourceValue = useMemo<string>(() => {
    const cleanPath = pathname.replace(/\/+$/, "") || "/";
    return cleanPath;
  }, [pathname]);

  return (
    <section className="bg-[#0f172a] py-20" id="get-in-touch">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Title */}
        <div className="text-3xl font-bold text-white mb-4 text-center">
          <span>{computedMainTitle}</span>
        </div>

        {/* Subtitle */}
        {computedSubtitle && (
          <div className="text-lg text-gray-300 mb-12 text-center">
            <span>{computedSubtitle}</span>
          </div>
        )}

        <div
          className={
            variant === "tabb"
              ? "flex justify-center"
              : "grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
          }
        >
          {/* Left column: Ways to Contact + Office Hours */}
          {variant !== "tabb" && (
            <div className="space-y-8">
              <div className="bg-[#1a202c] p-8 rounded-lg shadow-xl border border-white">
                <h3 className="text-xl font-bold text-white mt-1">{waysTitle}</h3>
                <p className="text-gray-300 mb-6">{waysSubtitle}</p>
                <ul className="space-y-4 list-none">
                {contactItems.map((item, index) => {
                  const Icon = iconComponents[item.icon_name || ""] || Clock;
                  const rawTitle =
                    typeof item.title === "string" ? item.title.trim() : "";
                  const isQuickResponse = rawTitle.toLowerCase() === "quick response";
                  const displayTitle = isQuickResponse ? "Want to Meet?" : rawTitle;
                  const hasLabel = displayTitle.length > 0;
                  const rawDescription =
                    typeof item.description === "string"
                      ? item.description.trim()
                      : "";
                  const hasDesc = isQuickResponse
                    ? true
                    : rawDescription.length > 0;
                  if (!hasLabel && !hasDesc) return null;

                  return (
                    <li key={index} className="flex items-start space-x-3 pl-0">
                      <Icon className="w-6 h-6 text-[#BBFEFF] flex-shrink-0" />
                      <div>
                        {hasLabel && (
                          <p className="text-white mb-1 font-semibold">{displayTitle}</p>
                        )}
                        {hasDesc &&
                          (isQuickResponse ? (
                            <a
                              href="https://calendly.com/hello-lunim/30min"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-300 underline underline-offset-4 hover:text-cyan-100 transition-colors"
                            >
                              Book a meeting with us now
                            </a>
                          ) : (
                            <p className="text-gray-200 text-base">{rawDescription}</p>
                          ))}
                      </div>
                    </li>
                  );
                })}
                </ul>
              </div>

              <div className="bg-[#1a202c] p-8 rounded-lg shadow-xl border border-white">
                <h3 className="text-xl font-bold text-white mt-1 mb-6">
                  {asText(slice.primary.office_hours_title) || "Office Hours"}
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
          )}

          {/* Right column: Form */}
          <div
            className={
              variant === "tabb"
                ? "flex justify-center items-center w-full max-w-lg"
                : undefined
            }
          >
            <ContactForm
              title={slice.primary.form_title}
              fullNameLabel={slice.primary.full_name_field_label ?? undefined}
              emailLabel={slice.primary.email_field_label ?? undefined}
              companyLabel={slice.primary.company_field_label ?? undefined}
              budgetLabel={slice.primary.project_budget_label ?? undefined}
              goalsLabel={slice.primary.project_goals_label ?? undefined}
              buttonLabel={slice.primary.button_label ?? undefined}
              budgetOptions={budgetOptions ?? undefined}
              variant={variant}
              source={sourceValue}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
