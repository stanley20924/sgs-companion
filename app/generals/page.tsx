import { Suspense } from "react";
import GeneralsBrowser from "../../components/generals-browser";

export default function GeneralsPage() {
  return (
    <Suspense fallback={null}>
      <GeneralsBrowser />
    </Suspense>
  );
}
