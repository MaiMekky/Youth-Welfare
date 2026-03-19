import EventForm from "../component/EventForm";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventForm mode="edit" id={id} />;
}