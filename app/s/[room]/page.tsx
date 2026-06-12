import SessionApp from '../../../components/session-app';

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ room: string }>;
  searchParams?: Promise<{ mode?: string }>;
}) {
  const { room } = await params;
  const query = searchParams ? await searchParams : {};
  const initialMode: "國戰" | "身分局" = query.mode === "identity" ? "身分局" : "國戰";

  return <SessionApp roomCode={room.toUpperCase()} initialMode={initialMode} />;
}
