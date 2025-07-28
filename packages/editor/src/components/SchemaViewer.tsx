import { Code2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Editor } from '@monaco-editor/react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@parama-ui/react';

interface SchemaViewerProps {
  schema: Record<string, any>;
}

export const SchemaViewer: React.FC<SchemaViewerProps> = ({ schema }) => {
  const handleCopy = () => {
    toast.success('Copied to clipboard');
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
  };
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" color="secondary" variant="outline">
          <Code2Icon size={16} />
          Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:!max-w-3xl">
        <DialogHeader>
          <DialogTitle>JSON Schema</DialogTitle>
          <DialogDescription>Schema form generated</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Editor
            height={600}
            theme="light"
            className="border border-gray-300"
            language="json"
            value={JSON.stringify(schema, null, 2)}
            onMount={(editor) => {
              editor.getModel()?.updateOptions({ tabSize: 2 });
              editor.updateOptions({
                fontFamily: "'Fira Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
                fontSize: 13
              });
            }}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              lineNumbers: 'off',
              fontFamily: "'Fira Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
              fontSize: 13
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" color="secondary" onClick={handleDownload}>
            Download
          </Button>
          <Button onClick={handleCopy}>Copy JSON</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
