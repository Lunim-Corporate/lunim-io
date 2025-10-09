import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `WebsiteCard`.
 */
export type WebsiteCardProps = SliceComponentProps<Content.WebsiteCardSlice>;

/**
 * Component for "WebsiteCard" Slices.
 */
const WebsiteCard: FC<WebsiteCardProps> = ({ slice }) => {
  return (
    <div><pre>{JSON.stringify(slice, null, 2)}</pre></div>
  );
};

export default WebsiteCard;
