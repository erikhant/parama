import { useFormBuilder } from '@form-builder/core';
import { useEditor } from '../store/useEditor';
import { FieldTypeDef } from './fieldTypes';
import { ToolboxList } from './ToolboxList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@parama-ui/react';

export const ToolboxPanel = () => {
  const { toolbox } = useEditor();
  const { templates } = useFormBuilder();
  const templateList: FieldTypeDef[] = templates.map((template) => ({
    id: template.id,
    label: template.name,
    description: template.description,
    group: 'other'
  }));

  return (
    <div
      id="toolbox"
      className="w-80 shrink-0 max-h-screen overflow-y-auto overflow-x-hidden bg-gray-50 border-r-2 border-gray-100/60">
      <Tabs defaultValue="fields">
        <TabsList className="rounded-none grid-cols-3 h-12 bg-gray-50 border-b border-gray-200">
          <TabsTrigger
            className="h-full rounded-md border-transparent data-[state=active]:border data-[state=active]:border-gray-100"
            value="fields">
            Fields
          </TabsTrigger>
          <TabsTrigger
            className="h-full rounded-md border-transparent data-[state=active]:border data-[state=active]:border-gray-100"
            value="presets">
            Presets
          </TabsTrigger>
          <TabsTrigger
            className="h-full rounded-md border-transparent data-[state=active]:border data-[state=active]:border-gray-100"
            value="templates">
            Templates
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fields">
          <ToolboxList items={toolbox.fields} />
        </TabsContent>
        <TabsContent value="presets">
          <ToolboxList items={templateList} />
        </TabsContent>
        <TabsContent value="templates">
          <ToolboxList items={templateList} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
