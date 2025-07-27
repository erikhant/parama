import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import type { ExternalDataSource, FieldGroupItem } from '@parama-dev/form-builder-types';
import React, { useState } from 'react';
import { CircleAlertIcon, HelpCircleIcon, Loader2Icon, PlusIcon, Trash2Icon } from 'lucide-react';
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

const mapHeaders = (headers: Header[]) => {
  return headers.reduce(
    (acc, header) => {
      if (header.key.trim()) {
        acc[header.key] = header.value;
      }
      return acc;
    },
    {} as Record<string, string>
  );
};

const arrayHeaders = (headersObj: Record<string, string>) => {
  return Object.entries(headersObj).map(([key, value]) => ({
    id: Date.now().toString() + Math.random().toString(),
    key,
    value
  }));
};

export const ExternalDataOptions = ({ children, external = { url: '' }, onChange }: ExternalDataOptionsProps) => {
  const [headers, setHeaders] = useState<Header[]>(arrayHeaders(external.headers || {}));
  const [externalData, setExternal] = useState<ExternalDataSource<FieldGroupItem>>(external);
  const [tab, setTab] = useState<'headers' | 'result' | 'mapper'>('headers');
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [apiUrl, setApiUrl] = useState(external.url || '');

  const addHeader = () => {
    const newHeader: Header = {
      id: Date.now().toString(),
      key: '',
      value: ''
    };
    const updatedHeaders = [...headers, newHeader];
    setHeaders(updatedHeaders);
    const mappedHeaders = mapHeaders(updatedHeaders);
    setExternal({ ...externalData, headers: mappedHeaders });
  };

  const removeHeader = (id: string) => {
    const updatedHeaders = headers.filter((header) => header.id !== id);
    setHeaders(updatedHeaders);
    const mappedHeaders = mapHeaders(updatedHeaders);
    setExternal({ ...externalData, headers: mappedHeaders });
  };

  const updateHeader = (id: string, field: 'key' | 'value', newValue: string) => {
    const updatedHeaders = headers.map((header) => (header.id === id ? { ...header, [field]: newValue } : header));
    setHeaders(updatedHeaders);
    const mappedHeaders = mapHeaders(updatedHeaders);
    setExternal({ ...externalData, headers: mappedHeaders });
  };

  const sendRequest = async () => {
    // Implement the logic to send the request to the data source URL
    // This could involve using fetch or axios to make the API call
    // and then updating the external.result with the response.
    setError(null);

    if (!externalData.url) {
      console.error('No source URL provided');
      return;
    }
    setLoading(true);
    await fetch(externalData.url, {
      method: 'GET',
      headers: {
        ...externalData.headers
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

  const isValidUrl = (url: string) => {
    const urlPattern = /^(https?:\/\/)(localhost|127\.0\.0\.1|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?(\/.*)?$/;
    return urlPattern.test(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? (
        <DialogTrigger asChild>{React.isValidElement(children) ? children : <span>{children}</span>}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" color="secondary">
            API source
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:!tw-max-w-3xl">
        <DialogHeader>
          <DialogTitle className="tw-text-gray-700">API source</DialogTitle>
          <DialogDescription>Manage API source settings</DialogDescription>
        </DialogHeader>
        <div className="tw-space-y-5">
          <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
            <FormGroup prefix="GET" className="tw-w-full">
              <Input
                value={apiUrl}
                className="!tw-rounded-tr-none !tw-rounded-br-none"
                placeholder="https://api.example.com/data"
                onChange={(e) => {
                  setApiUrl(e.target.value);
                  console.log('API URL changed:', isValidUrl(e.target.value));
                  if (isValidUrl(e.target.value)) {
                    setExternal({ ...externalData, url: e.target.value });
                  }
                }}
              />
            </FormGroup>
            <Button
              color="success"
              className="!tw-rounded-tl-none !tw-rounded-bl-none"
              disabled={loading || !isValidUrl(apiUrl)}
              onClick={sendRequest}>
              Send
            </Button>
          </div>
          <Tabs defaultValue={tab} className="tw-w-full">
            <TabsList className="tw-grid tw-w-full !tw-grid-cols-3 tw-bg-gray-100">
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="result">
                Result
                {error && <CircleAlertIcon className="tw-ml-1 tw-text-red-500" size={16} />}
                {!error && result && (
                  <Badge size="xs" color="success" className="ml-1">
                    OK
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="mapper">Data mapper</TabsTrigger>
            </TabsList>
            <TabsContent value="headers">
              <div className="tw-overflow-x-auto">
                <table className="tw-min-w-full">
                  <thead>
                    <tr>
                      <th className="tw-border tw-text-sm tw-text-gray-700 tw-p-2">Key</th>
                      <th className="tw-border tw-text-sm tw-text-gray-700 tw-p-2">Value</th>
                      <th className="tw-border tw-text-sm tw-text-gray-700 tw-p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {headers.map((header) => (
                      <tr key={header.id}>
                        <td className="tw-border">
                          <Input
                            className="tw-rounded-none tw-shadow-none tw-border-none focus-visible:tw-ring-0"
                            value={header.key}
                            onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                            placeholder="Header name"
                          />
                        </td>
                        <td className="tw-border">
                          <Input
                            className="tw-rounded-none tw-shadow-none tw-border-none focus-visible:tw-ring-0"
                            value={header.value}
                            onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                            placeholder="Header value"
                          />
                        </td>
                        <td className="tw-border tw-text-center">
                          <Button
                            variant="ghost"
                            color="secondary"
                            className="tw-text-gray-500"
                            size="xs"
                            onClick={() => removeHeader(header.id)}>
                            <Trash2Icon size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="tw-flex tw-justify-end tw-mt-2">
                  <Button variant="ghost" color="secondary" className="tw-text-gray-700" size="xs" onClick={addHeader}>
                    <PlusIcon size={16} />
                    Add row
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="result">
              <div className="tw-overflow-y-auto tw-max-h-[calc(100vh_-_300px)]">
                {result ? (
                  <Editor
                    height={600}
                    theme="vs-light"
                    className="tw-border tw-border-gray-300"
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
                    className={`${error ? 'tw-text-red-600' : 'tw-text-gray-500'} tw-text-center tw-text-sm  tw-bg-gray-50 tw-border tw-p-5 tw-rounded`}>
                    {error ? error.message : 'No result yet. Send a request to see the response.'}
                    {loading && (
                      <>
                        <Loader2Icon className="tw-animate-spin tw-ml-2 tw-inline-block" size={16} />
                        Loading..
                      </>
                    )}
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="mapper">
              <div className="tw-overflow-x-auto">
                {result || externalData.mapper ? (
                  <>
                    <p className="tw-text-blue-700 tw-leading-relaxed tw-text-sm tw-my-2 tw-p-3 tw-bg-blue-100 tw-rounded tw-border tw-border-blue-200">
                      <strong>Note:</strong> The mapper is used to transform the response data into a format suitable
                      for use in the select options. <br />
                    </p>
                    <table className="tw-min-w-full">
                      <thead>
                        <tr>
                          <th className="tw-border tw-text-sm tw-text-gray-700 tw-p-2">Property</th>
                          <th className="tw-border tw-text-sm tw-text-gray-700 tw-p-2">Target source</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="tw-border">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-pr-2">
                              <Input
                                className="tw-rounded-none tw-shadow-none tw-border-none focus-visible:tw-ring-0"
                                value="Source"
                                placeholder="Source"
                                readOnly
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="tw-text-gray-600">
                                      <HelpCircleIcon size={15} />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="tw-max-w-64 tw-mr-2" side="top">
                                    <p className="form-description tw-text-gray-700 tw-leading-relaxed">
                                      The key in the response object that contains the array of items you want to map.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                          <td className="tw-border">
                            <Input
                              className="tw-rounded-none tw-shadow-none tw-border-none focus-visible:tw-ring-0"
                              value={externalData.mapper?.dataSource || ''}
                              onChange={(e) =>
                                setExternal({
                                  ...externalData,
                                  mapper: {
                                    dataSource: e.target.value,
                                    dataMapper: externalData.mapper?.dataMapper || ({} as FieldGroupItem)
                                  }
                                })
                              }
                              placeholder="e.g. 'data' or 'items' in response"
                            />
                          </td>
                        </tr>
                        <tr>
                          <td className="tw-border">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-pr-2">
                              <Input
                                className="tw-rounded-none tw-shadow-none tw-border-none focus-visible:tw-ring-0"
                                value="ID"
                                placeholder="ID"
                                readOnly
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="tw-text-gray-600">
                                      <HelpCircleIcon size={15} />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="tw-max-w-64 tw-mr-2" side="top">
                                    <p className="form-description tw-text-gray-700 tw-leading-relaxed">
                                      The unique identifier for each item in the array.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                          <td className="tw-border">
                            <Input
                              className="tw-rounded-none tw-shadow-none tw-border-none focus-visible:tw-ring-0"
                              value={externalData.mapper?.dataMapper?.id || ''}
                              onChange={(e) =>
                                setExternal({
                                  ...externalData,
                                  mapper: {
                                    dataSource: externalData.mapper?.dataSource || '',
                                    dataMapper: {
                                      ...externalData.mapper?.dataMapper,
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
                          <td className="tw-border">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-pr-2">
                              <Input
                                className="tw-rounded-none tw-shadow-none tw-border-none focus-visible:tw-ring-0"
                                value="Label"
                                placeholder="Label"
                                readOnly
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="tw-text-gray-600">
                                      <HelpCircleIcon size={15} />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="tw-max-w-64 tw-mr-2" side="top">
                                    <p className="form-description tw-text-gray-700 tw-leading-relaxed">
                                      The text that will be displayed in the option list.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                          <td className="tw-border">
                            <Input
                              className="tw-rounded-none tw-shadow-none tw-border-none focus-visible:tw-ring-0"
                              value={externalData.mapper?.dataMapper?.label || ''}
                              onChange={(e) =>
                                setExternal({
                                  ...externalData,
                                  mapper: {
                                    dataSource: externalData.mapper?.dataSource || '',
                                    dataMapper: {
                                      ...externalData.mapper?.dataMapper,
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
                          <td className="tw-border">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-pr-2">
                              <Input
                                className="tw-rounded-none tw-shadow-none tw-border-none focus-visible:tw-ring-0"
                                value="Value"
                                placeholder="Value"
                                readOnly
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="tw-text-gray-600">
                                      <HelpCircleIcon size={15} />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="tw-max-w-64 tw-mr-2" side="top">
                                    <p className="form-description tw-text-gray-700 tw-leading-relaxed">
                                      The value that will be submitted when the option is selected.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                          <td className="tw-border">
                            <Input
                              className="tw-rounded-none tw-shadow-none tw-border-none focus-visible:tw-ring-0"
                              value={externalData.mapper?.dataMapper?.value || ''}
                              onChange={(e) =>
                                setExternal({
                                  ...externalData,
                                  mapper: {
                                    dataSource: externalData.mapper?.dataSource || '',
                                    dataMapper: {
                                      ...externalData.mapper?.dataMapper,
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
                          <td className="tw-border">
                            <div className="tw-flex tw-items-center tw-gap-2 tw-pr-2">
                              <Input
                                className="tw-rounded-none tw-shadow-none tw-border-none focus-visible:tw-ring-0"
                                value="Description (optional)"
                                placeholder="Description (optional)"
                                readOnly
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="tw-text-gray-600">
                                      <HelpCircleIcon size={15} />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="tw-max-w-64 tw-mr-2" side="top">
                                    <p className="form-description tw-text-gray-700 tw-leading-relaxed">
                                      An optional field that can be used to provide additional information about the
                                      option.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                          <td className="tw-border">
                            <Input
                              className="tw-rounded-none tw-shadow-none tw-border-none focus-visible:tw-ring-0"
                              value={externalData.mapper?.dataMapper?.description || ''}
                              onChange={(e) =>
                                setExternal({
                                  ...externalData,
                                  mapper: {
                                    dataSource: externalData.mapper?.dataSource || '',
                                    dataMapper: {
                                      ...externalData.mapper?.dataMapper,
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
                  <p className="tw-bg-gray-50 tw-border tw-p-5 tw-rounded tw-text-gray-500 tw-text-center tw-text-sm">
                    No mapping yet.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter className="tw-mt-5">
          <Button
            onClick={() => {
              setTab('mapper'); // Reset to headers tab after saving
              setError(null);
              setResult(null);
              setOpen(false);
              onChange(externalData);
            }}
            disabled={loading || externalData.url === '' || !isValidUrl(externalData.url) || !result}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
