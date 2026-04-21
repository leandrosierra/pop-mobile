import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { SocialProvider } from "@/services/socialAuth";
import { colors } from "@/theme";

type Props = {
  provider: SocialProvider;
  size?: number;
};

export function SocialProviderIcon({ provider, size = 24 }: Props) {
  if (provider === "apple") return <AppleIcon size={size} />;
  if (provider === "facebook") return <FacebookIcon size={size} />;
  if (provider === "instagram") return <InstagramIcon size={size} />;
  return <GoogleIcon size={size} />;
}

function AppleIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={colors.text}
        d="M12.15 6.9c-.95 0-2.42-1.08-3.96-1.04-2.04.03-3.91 1.18-4.96 3.01-2.12 3.68-.55 9.1 1.52 12.09 1.01 1.45 2.21 3.09 3.79 3.04 1.52-.07 2.09-.99 3.94-.99 1.83 0 2.35.99 3.96.95 1.64-.03 2.68-1.48 3.68-2.95 1.16-1.69 1.64-3.33 1.66-3.42-.04-.01-3.18-1.22-3.22-4.86-.03-3.04 2.48-4.49 2.6-4.56-1.43-2.09-3.62-2.32-4.39-2.38-2-.16-3.67 1.09-4.62 1.09zM15.53 3.83c.84-1.01 1.4-2.43 1.25-3.83-1.21.05-2.66.81-3.53 1.82-.78.9-1.45 2.34-1.27 3.71 1.34.11 2.71-.69 3.55-1.7z"
      />
    </Svg>
  );
}

function GoogleIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.05-3.71 1.05-2.86 0-5.29-1.93-6.16-4.53H2.15v2.86C3.96 20.53 7.66 23 12 23z" />
      <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.05H2.15A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.15 4.95l3.69-2.86z" />
      <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.66 1 3.96 3.47 2.15 7.05l3.69 2.86C6.71 7.31 9.14 5.38 12 5.38z" />
    </Svg>
  );
}

function FacebookIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="11" fill="#1877F2" />
      <Path fill="#fff" d="M14.83 12.72h2.37l.37-2.86h-2.74V8.05c0-.83.24-1.39 1.43-1.39h1.5V4.09c-.26-.04-1.16-.12-2.21-.12-2.19 0-3.69 1.34-3.69 3.79v2.1H9.39v2.86h2.47v7.08h2.97v-7.08z" />
    </Svg>
  );
}

function InstagramIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="instagramGradient" x1="4" y1="20" x2="20" y2="4">
          <Stop offset="0" stopColor="#F58529" />
          <Stop offset="0.35" stopColor="#DD2A7B" />
          <Stop offset="0.7" stopColor="#8134AF" />
          <Stop offset="1" stopColor="#515BD4" />
        </LinearGradient>
      </Defs>
      <Rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" fill="none" stroke="url(#instagramGradient)" strokeWidth="2.3" />
      <Circle cx="12" cy="12" r="4.15" fill="none" stroke="url(#instagramGradient)" strokeWidth="2.1" />
      <Circle cx="17.25" cy="6.75" r="1.25" fill="#DD2A7B" />
    </Svg>
  );
}
