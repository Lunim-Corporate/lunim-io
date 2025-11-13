"use client";
import { FC } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import type { KeyTextField, RichTextField } from "@prismicio/types";
import { asText } from "@prismicio/helpers";
import EventbriteSection from "@/components/EventbriteSection";
type EventbriteSlice = {
  variation: "default";
  version: string;
  primary: {
    heading: RichTextField;
    description: RichTextField;
    eventbrite_event_id: KeyTextField;
    location_override: KeyTextField;
  };
  items: [];
};
type EventbriteProps = SliceComponentProps<EventbriteSlice>;
const Eventbrite: FC<EventbriteProps> = ({ slice }) => {
  const heading =
    asText(slice.primary.heading) || "Book Your Place on the AI Academy";
  const description = asText(slice.primary.description) || null;
  const eventId = slice.primary.eventbrite_event_id || "";
  const locationOverride = slice.primary.location_override || null;
  return (
    <section className="bg-black px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <EventbriteSection
          eventId={eventId}
          title={heading}
          description={description}
          locationOverride={locationOverride}
        />
      </div>
    </section>
  );
};
export default Eventbrite;
