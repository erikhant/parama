import { FormSchema } from '@parama-dev/form-builder-types';

export function FormMetadata({ schema }: { schema: FormSchema }) {
  const { id, title, description, version, createdAt, createdBy } = schema;
  return (
    <div className="tw-mt-5">
      <h3 className="tw-font-semibold tw-uppercase tw-text-xs tw-text-gray-400 tw-border-y tw-border-gray-200 tw-p-4">
        About
      </h3>
      <div className="tw-px-4">
        <table className="tw-overflow-hidden">
          <tbody>
            <tr>
              <td className="tw-py-2 tw-pr-4 tw-text-gray-500 tw-text-sm">Id</td>
              <td className="tw-text-sm tw-py-2 tw-max-w-40 tw-text-gray-600 tw-line-clamp-2">{id}</td>
            </tr>
            <tr>
              <td className="tw-py-2 tw-pr-4 tw-text-gray-500 tw-text-sm">Title</td>
              <td className="tw-text-sm tw-py-2 tw-max-w-40 tw-text-gray-600 tw-line-clamp-2">{title}</td>
            </tr>
            <tr>
              <td className="tw-py-2 tw-pr-4 tw-text-gray-500 tw-text-sm">Description</td>
              <td className="tw-text-sm tw-py-2 tw-max-w-40 tw-text-gray-600 tw-line-clamp-2">{description}</td>
            </tr>
            <tr>
              <td className="tw-py-2 tw-pr-4 tw-text-gray-500 tw-text-sm">Created At</td>
              <td className="tw-text-sm tw-py-2 tw-max-w-40 tw-text-gray-600 tw-line-clamp-2">{createdAt}</td>
            </tr>
            <tr>
              <td className="tw-py-2 tw-pr-4 tw-text-gray-500 tw-text-sm">Created By</td>
              <td className="tw-text-sm tw-py-2 tw-max-w-40 tw-text-gray-600 tw-line-clamp-2">{createdBy}</td>
            </tr>
            <tr>
              <td className="tw-py-2 tw-pr-4 tw-text-gray-500 tw-text-sm">Version</td>
              <td className="tw-text-sm tw-py-2 tw-max-w-40 tw-text-gray-600 tw-line-clamp-2">{version}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
