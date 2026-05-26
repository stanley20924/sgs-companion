import SessionApp from '../../../components/session-app';

export default async function RoomPage({ params }: { params: Promise<{ room: string }> }) {
  const { room } = await params;
  return <SessionApp roomCode={room.toUpperCase()} />;
}
