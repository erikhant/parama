import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FormGroup,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@parama-ui/react';
import type { ExternalDataSource, FieldGroupItem } from '@form-builder/types';
import { useState } from 'react';
import { CircleAlertIcon, HelpCircleIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { Editor } from '@monaco-editor/react';

type ExternalDataOptionsProps = {
  children?: React.ReactNode;
  external?: ExternalDataSource<FieldGroupItem>;
  onChange: (value: ExternalDataSource<FieldGroupItem>) => void;
};

type Header = {
  id: string;
  key: string;
  value: string;
};

export function ExternalDataOptions({
  children,
  external = { source: '' },
  onChange
}: ExternalDataOptionsProps) {
  const [headers, setHeaders] = useState<Header[]>([
    { id: Date.now().toString(), key: 'Content-Type', value: 'application/json' }
  ]);
  const [tab, setTab] = useState<'headers' | 'result' | 'mapper'>('headers');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addHeader = () => {
    const newHeader: Header = {
      id: Date.now().toString(),
      key: '',
      value: ''
    };
    const updatedHeaders = [...headers, newHeader];
    setHeaders(updatedHeaders);
    updateDataSourceHeaders(updatedHeaders);
  };

  const removeHeader = (id: string) => {
    const updatedHeaders = headers.filter((header) => header.id !== id);
    setHeaders(updatedHeaders);
    updateDataSourceHeaders(updatedHeaders);
  };

  const updateHeader = (id: string, field: 'key' | 'value', newValue: string) => {
    const updatedHeaders = headers.map((header) =>
      header.id === id ? { ...header, [field]: newValue } : header
    );
    setHeaders(updatedHeaders);
    updateDataSourceHeaders(updatedHeaders);
  };

  const updateDataSourceHeaders = (updatedHeaders: Header[]) => {
    const headersObject = updatedHeaders.reduce(
      (acc, header) => {
        if (header.key.trim()) {
          acc[header.key] = header.value;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    onChange({
      ...external,
      headers: headersObject
    });
  };

  const sendRequest = async () => {
    // Implement the logic to send the request to the data source URL
    // This could involve using fetch or axios to make the API call
    // and then updating the external.result with the response.
    console.log('Sending request to:', external.source);
    if (!external.source) {
      console.error('No source URL provided');
      return;
    }
    setLoading(true);
    await fetch(external.source, {
      method: 'GET',
      headers: {
        ...external.headers
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setResult(data);
        setTab('result'); // Switch to result tab after sending request
      })
      .catch((error) => {
        setError(error);
        setResult(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button variant="ghost" size="sm" color="secondary">
            API source
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-gray-700">API source</DialogTitle>
          <DialogDescription>Manage API source settings</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-1 mb-2">
            <FormGroup prefix="GET" className="w-full">
              <Input
                value={external.source}
                placeholder="https://api.example.com/data"
                onChange={(e) => onChange({ ...external, source: e.target.value })}
              />
            </FormGroup>
            <Button disabled={loading || external.source === ''} onClick={sendRequest}>
              Send
            </Button>
          </div>
          <Tabs defaultValue={tab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-gray-100">
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="result">
                {error ? <CircleAlertIcon color="text-red-500" size={16} /> : null} Result
              </TabsTrigger>
              <TabsTrigger value="mapper">Mapper</TabsTrigger>
            </TabsList>
            <TabsContent value="headers">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="border text-sm text-gray-700 p-2">Key</th>
                      <th className="border text-sm text-gray-700 p-2">Value</th>
                      <th className="border text-sm text-gray-700 p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {headers.map((header) => (
                      <tr key={header.id}>
                        <td className="border">
                          <Input
                            className="rounded-none shadow-none border-none focus-visible:ring-0"
                            value={header.key}
                            onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                            placeholder="Header name"
                          />
                        </td>
                        <td className="border">
                          <Input
                            className="rounded-none shadow-none border-none focus-visible:ring-0"
                            value={header.value}
                            onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                            placeholder="Header value"
                          />
                        </td>
                        <td className="border text-center">
                          <Button
                            variant="ghost"
                            color="secondary"
                            className="text-gray-500"
                            size="xs"
                            onClick={() => removeHeader(header.id)}>
                            <Trash2Icon size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end mt-2">
                  <Button
                    variant="ghost"
                    color="secondary"
                    className="text-gray-700"
                    size="xs"
                    onClick={addHeader}>
                    <PlusIcon size={16} />
                    Add row
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="result">
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
                  <p className="text-gray-500 text-center text-sm  bg-gray-50 border p-5 rounded">
                    No result yet. Send a request to see the response.
                  </p>
                )}
                {error && <p className="text-red-600 mt-3">{error}</p>}
                {loading && <p className="text-blue-600 mt-3">Loading...</p>}
              </div>
            </TabsContent>
            <TabsContent value="mapper">
              <div className="overflow-x-auto">
                {result ? (
                  <>
                    <p className="text-blue-700 leading-relaxed text-sm my-2 p-3 bg-blue-100 rounded border border-blue-200">
                      <strong>Note:</strong> The mapper is used to transform the response data into
                      a format suitable for use in the select options. <br />
                    </p>
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="border text-sm text-gray-700 p-2">Property</th>
                          <th className="border text-sm text-gray-700 p-2">Target source</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border">
                            <div className="flex items-center gap-2 pr-2">
                              <Input
                                className="rounded-none shadow-none border-none focus-visible:ring-0"
                                value="Source"
                                placeholder="Source"
                                readOnly
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-gray-600">
                                      <HelpCircleIcon size={15} />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-64 mr-2" side="top">
                                    <p className="form-description text-gray-700 leading-relaxed">
                                      The key in the response object that contains the array of
                                      items you want to map.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                          <td className="border">
                            <Input
                              className="rounded-none shadow-none border-none focus-visible:ring-0"
                              value={external.mapper?.dataSource || ''}
                              onChange={(e) =>
                                onChange({
                                  ...external,
                                  mapper: {
                                    dataSource: e.target.value,
                                    dataMapper:
                                      external.mapper?.dataMapper || ({} as FieldGroupItem)
                                  }
                                })
                              }
                              placeholder="e.g. 'data' or 'items' in response"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="border">
                            <div className="flex items-center gap-2 pr-2">
                              <Input
                                className="rounded-none shadow-none border-none focus-visible:ring-0"
                                value="ID"
                                placeholder="ID"
                                readOnly
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-gray-600">
                                      <HelpCircleIcon size={15} />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-64 mr-2" side="top">
                                    <p className="form-description text-gray-700 leading-relaxed">
                                      The unique identifier for each item in the array.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                          <td className="border">
                            <Input
                              className="rounded-none shadow-none border-none focus-visible:ring-0"
                              value={external.mapper?.dataMapper?.id || ''}
                              onChange={(e) =>
                                onChange({
                                  ...external,
                                  mapper: {
                                    dataSource: external.mapper?.dataSource || '',
                                    dataMapper: {
                                      ...external.mapper?.dataMapper,
                                      id: e.target.value
                                    } as FieldGroupItem
                                  }
                                })
                              }
                              placeholder="e.g. 'id' or 'key' in response"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="border">
                            <div className="flex items-center gap-2 pr-2">
                              <Input
                                className="rounded-none shadow-none border-none focus-visible:ring-0"
                                value="Label"
                                placeholder="Label"
                                readOnly
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-gray-600">
                                      <HelpCircleIcon size={15} />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-64 mr-2" side="top">
                                    <p className="form-description text-gray-700 leading-relaxed">
                                      The text that will be displayed in the option list.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                          <td className="border">
                            <Input
                              className="rounded-none shadow-none border-none focus-visible:ring-0"
                              value={external.mapper?.dataMapper?.label || ''}
                              onChange={(e) =>
                                onChange({
                                  ...external,
                                  mapper: {
                                    dataSource: external.mapper?.dataSource || '',
                                    dataMapper: {
                                      ...external.mapper?.dataMapper,
                                      label: e.target.value
                                    } as FieldGroupItem
                                  }
                                })
                              }
                              placeholder="e.g. 'name' or 'title' in response"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="border">
                            <div className="flex items-center gap-2 pr-2">
                              <Input
                                className="rounded-none shadow-none border-none focus-visible:ring-0"
                                value="Value"
                                placeholder="Value"
                                readOnly
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-gray-600">
                                      <HelpCircleIcon size={15} />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-64 mr-2" side="top">
                                    <p className="form-description text-gray-700 leading-relaxed">
                                      The value that will be submitted when the option is selected.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                          <td className="border">
                            <Input
                              className="rounded-none shadow-none border-none focus-visible:ring-0"
                              value={external.mapper?.dataMapper?.value || ''}
                              onChange={(e) =>
                                onChange({
                                  ...external,
                                  mapper: {
                                    dataSource: external.mapper?.dataSource || '',
                                    dataMapper: {
                                      ...external.mapper?.dataMapper,
                                      value: e.target.value
                                    } as FieldGroupItem
                                  }
                                })
                              }
                              placeholder="e.g. 'value' or 'id' in response"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="border">
                            <div className="flex items-center gap-2 pr-2">
                              <Input
                                className="rounded-none shadow-none border-none focus-visible:ring-0"
                                value="Description"
                                placeholder="Description (optional)"
                                readOnly
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-gray-600">
                                      <HelpCircleIcon size={15} />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-64 mr-2" side="top">
                                    <p className="form-description text-gray-700 leading-relaxed">
                                      An optional field that can be used to provide additional
                                      information about the option.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                          <td className="border">
                            <Input
                              className="rounded-none shadow-none border-none focus-visible:ring-0"
                              value={external.mapper?.dataMapper?.description || ''}
                              onChange={(e) =>
                                onChange({
                                  ...external,
                                  mapper: {
                                    dataSource: external.mapper?.dataSource || '',
                                    dataMapper: {
                                      ...external.mapper?.dataMapper,
                                      description: e.target.value
                                    } as FieldGroupItem
                                  }
                                })
                              }
                              placeholder="e.g. 'description' or 'info' in response"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                ) : (
                  <p className="bg-gray-50 border p-5 rounded text-gray-500 text-center text-sm">
                    No mapping yet.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
