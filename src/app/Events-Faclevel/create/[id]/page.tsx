import EventForm from "../component/EventForm";

export default function Page({ params }: { params: { id: string } }) {
  return <EventForm mode="edit" id={params.id} />;
}