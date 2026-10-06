import { ArrowLeft, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPanel({ what, backTo, backLabel }) {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded bg-steel-100 text-steel-700">
        <SearchX size={26} />
      </span>
      <h1 className="mt-5 font-display text-3xl font-semibold leading-none text-coal-900">{what} not found</h1>
      <p className="mt-3 text-steel-600">It may have been removed, or the link is wrong.</p>
      <Link to={backTo} className="btn-secondary mt-7 h-12 px-5">
        <ArrowLeft size={18} />
        {backLabel}
      </Link>
    </div>
  );
}
