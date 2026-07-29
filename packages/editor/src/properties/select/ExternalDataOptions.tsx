import type { ExternalDataSource, FieldGroupItem } from '@parama-dev/form-builder-types';
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
  TabsTrigger
} from '@parama-ui/react';
import { CircleAlertIcon } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { HeadersTable } from './externalData/HeadersTable';
import { addHeaderRow, removeHeaderRow, toHeaderList, toHeaderMap, updateHeaderRow } from './externalData/headers';
import { isValidApiUrl, readMapperField, withMapperField, type MapperKey } from './externalData/mapper';
import { MapperTable } from './externalData/MapperTable';
import { ResultViewer } from './externalData/ResultViewer';
import { useApiProbe } from './externalData/useApiProbe';

type Source = ExternalDataSource<FieldGroupItem>;

type ExternalDataOptionsProps = {
  children?: React.ReactNode;
  external?: Source;
  onChange: (value: Source) => void;
};

type TabKey = 'headers' | 'result' | 'mapper';

const EMPTY_SOURCE: Source = { url: '' };

/**
 * Dialog for configuring a field's remote option source.
 *
 * Three steps, one per tab: set the request up (URL and headers), probe the
 * endpoint to see a real response, then map that response onto the option
 * shape. Saving is blocked until the probe succeeds, because a mapping written
 * against a response nobody has seen is a guess.
 *
 * Edits are held locally and only published on save, so abandoning the dialog
 * leaves the field's existing configuration untouched.
 */
export const ExternalDataOptions = ({ children, external = EMPTY_SOURCE, onChange }: ExternalDataOptionsProps) => {
  const [source, setSource] = useState<Source>(external);
  const [headerRows, setHeaderRows] = useState(() => toHeaderList(external.headers));
  const [apiUrl, setApiUrl] = useState(external.url || '');
  const [tab, setTab] = useState<TabKey>('headers');
  const [open, setOpen] = useState(false);

  const probe = useApiProbe();

  // Re-seed when the dialog is pointed at a different field. Compared by
  // content rather than reference: the parent rebuilds this object on every
  // render, so a reference check would reset the form mid-edit.
  const externalKey = JSON.stringify(external);
  useEffect(() => {
    setSource(external);
    setHeaderRows(toHeaderList(external.headers));
    setApiUrl(external.url || '');
    setTab('headers');
    probe.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalKey]);

  /** Writes rows to local state and mirrors them into the source's header map. */
  const commitHeaders = useCallback((rows: ReturnType<typeof toHeaderList>) => {
    setHeaderRows(rows);
    setSource((current) => ({ ...current, headers: toHeaderMap(rows) }));
  }, []);

  const handleUrlChange = useCallback((value: string) => {
    setApiUrl(value);
    // Only a usable URL reaches the source, so a half-typed one cannot be saved.
    if (isValidApiUrl(value)) setSource((current) => ({ ...current, url: value }));
  }, []);

  const handleSend = useCallback(async () => {
    await probe.send(apiUrl, source.headers);
    setTab('result');
  }, [probe, apiUrl, source.headers]);

  const handleMapperChange = useCallback(
    (key: MapperKey, value: string) => setSource((current) => withMapperField(current, key, value)),
    []
  );

  const handleSave = useCallback(() => {
    onChange(source);
    setOpen(false);
    setTab('mapper');
    probe.reset();
  }, [onChange, source, probe]);

  const canSend = !probe.loading && isValidApiUrl(apiUrl);
  const canSave = canSend && Boolean(probe.result) && isValidApiUrl(source.url);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          React.isValidElement(children) ? (
            children
          ) : (
            <span>{children}</span>
          )
        ) : (
          <Button variant="ghost" size="sm" color="secondary">
            API source
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:!max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-gray-700">API source</DialogTitle>
          <DialogDescription>Manage API source settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center justify-between mb-2">
            <FormGroup prefix="GET" className="w-full">
              <Input
                value={apiUrl}
                className="!rounded-tr-none !rounded-br-none"
                placeholder="https://api.example.com/data"
                aria-label="API URL"
                onChange={(event) => handleUrlChange(event.target.value)}
              />
            </FormGroup>
            <Button
              color="success"
              className="!rounded-tl-none !rounded-bl-none"
              disabled={!canSend}
              onClick={handleSend}>
              Send
            </Button>
          </div>

          <Tabs value={tab} onValueChange={(next) => setTab(next as TabKey)} className="w-full">
            <TabsList className="grid w-full !grid-cols-3 bg-gray-100">
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="result">
                Result
                {probe.error && <CircleAlertIcon className="ml-1 text-red-500" size={16} />}
                {!probe.error && Boolean(probe.result) && (
                  <Badge size="xs" color="success" className="ml-1">
                    OK
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="mapper">Data mapper</TabsTrigger>
            </TabsList>

            <TabsContent value="headers">
              <HeadersTable
                rows={headerRows}
                onAdd={() => commitHeaders(addHeaderRow(headerRows))}
                onUpdate={(id, property, value) => commitHeaders(updateHeaderRow(headerRows, id, property, value))}
                onRemove={(id) => commitHeaders(removeHeaderRow(headerRows, id))}
              />
            </TabsContent>

            <TabsContent value="result">
              <ResultViewer result={probe.result} error={probe.error} loading={probe.loading} />
            </TabsContent>

            <TabsContent value="mapper">
              <MapperTable
                readValue={(key) => readMapperField(source, key)}
                onChange={handleMapperChange}
                hasSomethingToMap={Boolean(probe.result || source.mapper)}
              />
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="mt-5">
          <Button onClick={handleSave} disabled={!canSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
