import { FormSchema } from '@form-builder/types';

export function FormMetadata({ schema }: { schema: FormSchema }) {
  const { id, title, description, version, createdAt, createdBy } = schema;
  return (
    <div className="mt-5">
      <h3 className="font-semibold uppercase text-xs text-gray-400 border-y border-gray-200 p-4">About</h3>
      <div className="px-4">
        <table className="overflow-hidden">
          <tbody>
            <tr>
              <td className="py-2 pr-4 text-gray-500 text-sm">Id</td>
              <td className="text-sm py-2 max-w-40 text-gray-600 line-clamp-2">{id}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-500 text-sm">Title</td>
              <td className="text-sm py-2 max-w-40 text-gray-600 line-clamp-2">{title}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-500 text-sm">Description</td>
              <td className="text-sm py-2 max-w-40 text-gray-600 line-clamp-2">{description}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-500 text-sm">Created At</td>
              <td className="text-sm py-2 max-w-40 text-gray-600 line-clamp-2">{createdAt}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-500 text-sm">Created By</td>
              <td className="text-sm py-2 max-w-40 text-gray-600 line-clamp-2">{createdBy}</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-gray-500 text-sm">Version</td>
              <td className="text-sm py-2 max-w-40 text-gray-600 line-clamp-2">{version}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
