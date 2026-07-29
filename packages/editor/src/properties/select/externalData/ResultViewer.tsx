import { Editor } from '@monaco-editor/react';
import { Loader2Icon } from 'lucide-react';
import { memo } from 'react';

interface ResultViewerProps {
  result: unknown;
  error: Error | null;
  loading: boolean;
}

/** Read-only JSON view of the probe response, or the reason there isn't one. */
export const ResultViewer = memo<ResultViewerProps>(({ result, error, loading }) => (
  <div className="overflow-y-auto max-h-[calc(100vh_-_300px)]">
    {result ? (
      <Editor
        height={600}
        theme="vs-light"
        className="border border-gray-300"
        language="json"
        value={JSON.stringify(result, null, 2)}
        onMount={(editor) => {
          editor.getModel()?.updateOptions({ tabSize: 2 });
        }}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true
        }}
      />
    ) : (
      <p
        className={`${error ? 'text-red-600' : 'text-gray-500'} text-center text-sm bg-gray-50 border p-5 rounded`}>
        {error ? error.message : 'No result yet. Send a request to see the response.'}
        {loading && (
          <>
            <Loader2Icon className="animate-spin ml-2 inline-block" size={16} />
            Loading..
          </>
        )}
      </p>
    )}
  </div>
));

ResultViewer.displayName = 'ResultViewer';
