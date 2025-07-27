import { Tabs, TabsContent, TabsList, TabsTrigger } from '@parama-ui/react';
import { useState, useEffect } from 'react';
import { useEditor } from '../store/useEditor';
import { ToolboxList } from './ToolboxList';

export const ToolboxPanel = () => {
  const { toolbox, editor } = useEditor();
  const [activeTab, setActiveTab] = useState<string>('fields');

  // Set the active tab based on editor options when they become available
  useEffect(() => {
    if (editor.options?.defaultFieldTab) {
      setActiveTab(editor.options.defaultFieldTab);
    }
  }, [editor.options?.defaultFieldTab]);

  return (
    <div
      id="toolbox"
      className="tw-w-80 tw-shrink-0 tw-max-h-screen tw-overflow-y-auto tw-overflow-x-hidden tw-bg-gray-50 tw-border-r-2 tw-border-gray-100/60">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="tw-h-full">
        <TabsList bordered className="tw-rounded-none tw-grid-cols-2 tw-h-12 tw-sticky tw-top-0 tw-z-10">
          <TabsTrigger className="tw-h-full tw-rounded-md" value="fields">
            Fields
          </TabsTrigger>
          <TabsTrigger className="tw-h-full tw-rounded-md" value="presets">
            Presets
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fields">
          <ToolboxList items={toolbox.fields} showSearch={true} searchPlaceholder="Search fields" />
        </TabsContent>
        <TabsContent value="presets">
          <ToolboxList items={toolbox.presets} showSearch={true} searchPlaceholder="Search presets" />
        </TabsContent>
      </Tabs>
    </div>
  );
};
