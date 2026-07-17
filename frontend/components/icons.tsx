import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (props: IconProps) => (
  <Icon {...props}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></Icon>
);
export const UserIcon = (props: IconProps) => (
  <Icon {...props}><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></Icon>
);
export const PenIcon = (props: IconProps) => (
  <Icon {...props}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></Icon>
);
export const LoginIcon = (props: IconProps) => (
  <Icon {...props}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="m10 17 5-5-5-5" /><path d="M15 12H3" /></Icon>
);
export const LogoutIcon = (props: IconProps) => (
  <Icon {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m14 17 5-5-5-5" /><path d="M19 12H7" /></Icon>
);
export const SearchIcon = (props: IconProps) => (
  <Icon {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>
);
export const MessageIcon = (props: IconProps) => (
  <Icon {...props}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /></Icon>
);
export const RepeatIcon = (props: IconProps) => (
  <Icon {...props}><path d="m17 1 4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="m7 23-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></Icon>
);
export const HeartIcon = (props: IconProps) => (
  <Icon {...props}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></Icon>
);
export const ShareIcon = (props: IconProps) => (
  <Icon {...props}><path d="M12 3v13" /><path d="m7 8 5-5 5 5" /><path d="M5 13v7h14v-7" /></Icon>
);
export const ArrowLeftIcon = (props: IconProps) => (
  <Icon {...props}><path d="m15 18-6-6 6-6" /></Icon>
);
export const MoreIcon = (props: IconProps) => (
  <Icon {...props}><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></Icon>
);
export const SparkIcon = (props: IconProps) => (
  <Icon {...props}><path d="m12 3 1.2 4.2L17 9l-3.8 1.8L12 15l-1.2-4.2L7 9l3.8-1.8Z" /><path d="m19 15 .6 2.1 1.9.9-1.9.9L19 21l-.6-2.1-1.9-.9 1.9-.9Z" /></Icon>
);
