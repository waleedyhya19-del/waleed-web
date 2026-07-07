import { RadarLoader } from './radar-loader';

export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center">
      <RadarLoader size={32} />
    </div>
  );
}
