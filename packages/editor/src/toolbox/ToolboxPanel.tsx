import { Tabs, TabsContent, TabsList, TabsTrigger } from '@parama-ui/react';
import { useEditor } from '../store/useEditor';
import { ToolboxList } from './ToolboxList';

export const ToolboxPanel = () => {
  const { toolbox } = useEditor();
  return (
    <div
      id="toolbox"
      className="w-80 shrink-0 max-h-screen overflow-y-auto overflow-x-hidden bg-gray-50 border-r-2 border-gray-100/60">
      <Tabs defaultValue="fields">
        <TabsList bordered className="rounded-none grid-cols-2 h-12 sticky top-0 z-10">
          <TabsTrigger className="h-full rounded-md" value="fields">
            Fields
          </TabsTrigger>
          <TabsTrigger className="h-full rounded-md" value="presets">
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
