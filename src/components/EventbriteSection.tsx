"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock } from "lucide-react";
import EventbriteWidget from "./EventbriteWidget";

const DEFAULT_EVENT_ID =
  process.env.NEXT_PUBLIC_EVENTBRITE_EVENT_ID ?? "1967972076457";

interface EventbriteCourseInfo {
  id: string;
  name: string;
  summary?: string | null;
  startLocal?: string | null;
  endLocal?: string | null;
  timezone?: string | null;
  venueLine?: string | null;
  url?: string | null;
  priceDisplay?: string | null;
}

type FetchState = "idle" | "loading" | "ready" | "error";

const formatDate = (value?: string | null, options?: Intl.DateTimeFormatOptions) => {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", options).format(new Date(value));
  } catch {
    return null;
  }
};

const formatSchedule = (
  start?: string | null,
  end?: string | null,
  timezone?: string | null
) => {
  if (!start) return "Live cohort";

  const dateLabel = formatDate(start, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone ?? "UTC",
  });

  try {
    const startDate = new Date(start);
    const startTime = timeFormatter.format(startDate);

    if (!end) {
      return `${dateLabel} · ${startTime} ${timezone ?? "UTC"}`;
    }

    const endDate = new Date(end);
    const sameDay = startDate.toDateString() === endDate.toDateString();
    const endTime = timeFormatter.format(endDate);

    const dayPart = sameDay
      ? dateLabel
      : `${dateLabel} → ${formatDate(end, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`;

    return `${dayPart} · ${startTime} – ${endTime} ${timezone ?? "UTC"}`;
  } catch {
    return "Live cohort";
  }
};

const buildFallbackCourse = (eventId: string): EventbriteCourseInfo => {
  const safeId = eventId || DEFAULT_EVENT_ID;
  return {
    id: safeId,
    name: "AI First Marketing Academy",
    startLocal: null,
    endLocal: null,
    timezone: "UTC",
    priceDisplay: "£499",
    url: `https://www.eventbrite.co.uk/e/${safeId}`,
  };
};

interface EventbriteSectionProps {
  className?: string;
  eventId?: string;
  title?: string;
  description?: string | null;
  locationOverride?: string | null;
}

const EventbriteSection: React.FC<EventbriteSectionProps> = ({
  className = "",
  eventId,
  title,
  description,
  locationOverride,
}) => {
  const safeEventId = eventId?.trim() || DEFAULT_EVENT_ID;
  const fallbackCourse = useMemo(() => buildFallbackCourse(safeEventId), [safeEventId]);
  const [courseInfo, setCourseInfo] = useState<EventbriteCourseInfo>(fallbackCourse);
  const [status, setStatus] = useState<FetchState>("idle");

  useEffect(() => {
    setCourseInfo(fallbackCourse);
    setStatus("idle");
  }, [fallbackCourse]);

  useEffect(() => {
    let ignore = false;
    if (!safeEventId) return;

    const fetchCourse = async () => {
      setStatus("loading");
      try {
        const response = await fetch(`/api/eventbrite/course?eventId=${safeEventId}`);
        const payload = (await response.json()) as {
          success?: boolean;
          data?: EventbriteCourseInfo;
          message?: string;
        };

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.message || "Failed to load Eventbrite data.");
        }

        if (!ignore) {
          setCourseInfo(payload.data);
          setStatus("ready");
        }
      } catch (error) {
        console.error("Eventbrite course fetch failed", error);
        if (!ignore) {
          setStatus("error");
        }
      }
    };

    fetchCourse();

    return () => {
      ignore = true;
    };
  }, [safeEventId]);

  const scheduleLabel = formatSchedule(
    courseInfo?.startLocal,
    courseInfo?.endLocal,
    courseInfo?.timezone
  );
  const cohortDate =
    formatDate(courseInfo?.startLocal, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) ?? "TBA";
  const investment = courseInfo?.priceDisplay ?? "Request quote";
  const locationText =
    locationOverride?.trim() || courseInfo?.venueLine || "Online via Zoom";
  const effectiveEventId = courseInfo?.id || safeEventId;
  const heading = title?.trim() || "Book Your Place on the AI Academy";
  const supportingCopy = description?.trim() || courseInfo?.summary || null;

  return (
    <div
      className={`bg-[#0f172a] border border-white/20 rounded-3xl p-8 md:p-10 shadow-[0_24px_65px_rgba(0,0,0,0.45)] space-y-8 ${className}`}
    >
      <div className="text-center space-y-3">
        <h3 className="text-white text-3xl md:text-4xl font-semibold tracking-tight">
          {heading}
        </h3>
        {supportingCopy && (
          <p className="text-base text-gray-300 max-w-3xl mx-auto">
            {supportingCopy}
          </p>
        )}
        {status === "loading" && (
          <p className="text-sm text-cyan-200">Updating Eventbrite details…</p>
        )}
        {status === "error" && (
          <p className="text-sm text-rose-300">
            Unable to sync Eventbrite right now. Showing saved details.
          </p>
        )}
      </div>

      <dl className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-left">
          <dt className="text-sm uppercase tracking-[0.3em] text-white/50">
            Schedule
          </dt>
          <dd className="mt-3 text-white text-lg font-semibold space-y-2">
            <p>{scheduleLabel}</p>
            <p className="text-sm font-normal text-white/60">
              Next cohort: <span className="text-white">{cohortDate}</span>
            </p>
          </dd>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-left">
          <dt className="text-sm uppercase tracking-[0.3em] text-white/50">
            Investment
          </dt>
          <dd className="mt-3 text-white text-2xl font-semibold">{investment}</dd>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-left">
          <dt className="text-sm uppercase tracking-[0.3em] text-white/50">
            Location
          </dt>
          <dd className="mt-3 text-white text-2xl font-semibold">
            {locationText}
          </dd>
        </div>
      </dl>

      <div className="space-y-3">
        <EventbriteWidget
          eventId={effectiveEventId}
          buttonLabel="Book Course"
          eventUrl={courseInfo?.url}
        />
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
          <Lock className="h-4 w-4 text-[#BBFEFF]" />
          <span>Powered by Eventbrite · Secure checkout</span>
        </div>
      </div>
    </div>
  );
};

export default EventbriteSection;
